import { type ExpressionNode } from 'twenty-shared/expression';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  buildValidationRuleTreeConversions,
  type LegacyValidationRuleText,
} from 'src/database/commands/upgrade-version-command/2-65/utils/build-validation-rule-tree-conversions.util';
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

const buildRule = (
  rule: Pick<FlatValidationRule, 'id'> & Partial<FlatValidationRule>,
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
  tree: null,
  message: 'Message',
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...rule,
});

const convert = (
  rules: {
    rule: FlatValidationRule;
    legacyText?: LegacyValidationRuleText;
  }[],
) =>
  buildValidationRuleTreeConversions({
    flatValidationRules: rules.map(({ rule }) => rule),
    legacyValidationRuleTextById: new Map(
      rules.flatMap(
        ({ rule, legacyText }): [string, LegacyValidationRuleText][] =>
          isDefined(legacyText) ? [[rule.id, legacyText]] : [],
      ),
    ),
    ...buildMaps(),
  });

describe('buildValidationRuleTreeConversions', () => {
  it('should store the rule as a tree reading the bound fields by identifier', () => {
    const { flatValidationRulesToUpdate, unparsableValidationRuleIds } =
      convert([
        {
          rule: buildRule({ id: 'renamed' }),
          legacyText: {
            expression: 'employees > 10 and previous.stage != "WON"',
            bindings: {
              employees: 'employees',
              'previous.stage': 'stage',
            },
          },
        },
      ]);

    expect(unparsableValidationRuleIds).toEqual([]);
    expect(flatValidationRulesToUpdate).toMatchObject([
      {
        id: 'renamed',
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

  it('should leave a draft rule that has no text yet', () => {
    expect(
      convert([
        {
          rule: buildRule({ id: 'draft', isActive: false }),
          legacyText: { expression: ' ', bindings: {} },
        },
      ]).flatValidationRulesToUpdate,
    ).toEqual([]);
  });

  it('should turn off a rule whose text no longer parses, keeping its text', () => {
    const { flatValidationRulesToUpdate, unparsableValidationRuleIds } =
      convert([
        {
          rule: buildRule({ id: 'active' }),
          legacyText: { expression: 'stage ==', bindings: {} },
        },
        {
          rule: buildRule({ id: 'inactive', isActive: false }),
          legacyText: { expression: 'stage ==', bindings: {} },
        },
      ]);

    expect(unparsableValidationRuleIds).toEqual(['active', 'inactive']);
    expect(flatValidationRulesToUpdate).toEqual([
      buildRule({ id: 'active', isActive: false }),
    ]);
  });

  it('should leave a rule already stored as a tree', () => {
    expect(
      convert([
        {
          rule: buildRule({ id: 'converted', tree: READ_STAGE_TREE }),
          legacyText: { expression: 'stage == "WON"', bindings: {} },
        },
      ]).flatValidationRulesToUpdate,
    ).toEqual([]);
  });

  it('should leave a rule without legacy text', () => {
    expect(
      convert([{ rule: buildRule({ id: 'created-as-tree' }) }])
        .flatValidationRulesToUpdate,
    ).toEqual([]);
  });

  it('should never put the legacy text on the rules it updates', () => {
    const [convertedRule] = convert([
      {
        rule: buildRule({ id: 'converted' }),
        legacyText: { expression: 'stage == "WON"', bindings: {} },
      },
    ]).flatValidationRulesToUpdate;

    expect(convertedRule).not.toHaveProperty('expression');
    expect(convertedRule).not.toHaveProperty('bindings');
  });
});
