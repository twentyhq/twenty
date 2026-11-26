import { type ExpressionNode } from 'twenty-shared/expression';
import { FieldMetadataType } from 'twenty-shared/types';

import { buildValidationRuleTreeConversions } from 'src/database/commands/upgrade-version-command/2-65/utils/build-validation-rule-tree-conversions.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const NOW = '2026-11-26T00:00:00.000Z';

const READ_STAGE_TREE: ExpressionNode = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'stage',
};

const buildMaps = () => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: 'company-id',
      universalIdentifier: 'company',
      fieldIds: ['employees-id', 'stage-id'],
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });

  for (const field of [
    { id: 'employees-id', name: 'headcount', type: FieldMetadataType.NUMBER },
    { id: 'stage-id', name: 'stage', type: FieldMetadataType.SELECT },
  ]) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        ...field,
        universalIdentifier: field.id.replace('-id', ''),
        objectMetadataId: 'company-id',
      }),
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }

  return { flatObjectMetadataMaps, flatFieldMetadataMaps };
};

const buildLegacyRule = (
  rule: Pick<FlatValidationRule, 'id' | 'expression'> &
    Partial<FlatValidationRule>,
): FlatValidationRule => ({
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  universalIdentifier: rule.id,
  applicationUniversalIdentifier: 'application',
  objectMetadataId: 'company-id',
  objectMetadataUniversalIdentifier: 'company',
  errorFieldMetadataId: null,
  errorFieldMetadataUniversalIdentifier: null,
  name: rule.id,
  description: null,
  icon: null,
  bindings: {},
  tree: null,
  message: 'Message',
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...rule,
});

const convert = (flatValidationRules: FlatValidationRule[]) =>
  buildValidationRuleTreeConversions({
    flatValidationRules,
    ...buildMaps(),
  });

describe('buildValidationRuleTreeConversions', () => {
  it('should store the rule as a tree reading the bound fields by identifier', () => {
    const { flatValidationRulesToUpdate, unparsableValidationRuleIds } =
      convert([
        buildLegacyRule({
          id: 'renamed',
          expression: 'employees > 10 and previous.stage != "WON"',
          bindings: {
            employees: 'employees',
            'previous.stage': 'stage',
          },
        }),
      ]);

    expect(unparsableValidationRuleIds).toEqual([]);
    expect(flatValidationRulesToUpdate).toMatchObject([
      {
        id: 'renamed',
        expression: null,
        bindings: {},
        isActive: true,
        tree: {
          type: 'GROUP',
          logicalOperator: 'AND',
          children: [
            {
              type: 'COMPARISON',
              operator: 'GREATER_THAN',
              left: { type: 'FIELD', fieldUniversalIdentifier: 'employees' },
              right: { type: 'LITERAL', value: 10 },
            },
            {
              type: 'COMPARISON',
              operator: 'NOT_EQUAL',
              left: {
                type: 'FIELD',
                fieldUniversalIdentifier: 'stage',
                isPreviousValue: true,
              },
              right: { type: 'LITERAL', value: 'WON' },
            },
          ],
        },
      },
    ]);
  });

  it('should clear the text of a rule that has none yet', () => {
    expect(
      convert([
        buildLegacyRule({ id: 'draft', expression: '', isActive: false }),
      ]).flatValidationRulesToUpdate,
    ).toMatchObject([{ id: 'draft', expression: null, tree: null }]);
  });

  it('should turn off a rule whose text no longer parses, keeping its text', () => {
    const { flatValidationRulesToUpdate, unparsableValidationRuleIds } =
      convert([
        buildLegacyRule({ id: 'active', expression: 'stage ==' }),
        buildLegacyRule({
          id: 'inactive',
          expression: 'stage ==',
          isActive: false,
        }),
      ]);

    expect(unparsableValidationRuleIds).toEqual(['active', 'inactive']);
    expect(flatValidationRulesToUpdate).toMatchObject([
      { id: 'active', expression: 'stage ==', tree: null, isActive: false },
    ]);
  });

  it('should leave a rule already stored as a tree', () => {
    expect(
      convert([
        buildLegacyRule({
          id: 'converted',
          expression: null,
          tree: READ_STAGE_TREE,
        }),
      ]).flatValidationRulesToUpdate,
    ).toEqual([]);
  });
});
