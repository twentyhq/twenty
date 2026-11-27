/* @license Enterprise */

import { reconstructValidationRulesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-validation-rules-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { FieldMetadataType } from 'twenty-shared/types';

const NOW = '2026-11-02T00:00:00.000Z';

const readFieldTree = (fieldUniversalIdentifier: string) => ({
  type: 'FUNCTION_CALL',
  functionName: 'isNonEmptyString',
  arguments: [{ type: 'FIELD', fieldUniversalIdentifier }],
});

const reconstruct = ({
  isObjectExported = true,
  isErrorFieldResolvable = true,
  message = 'Message',
  tree = readFieldTree('reference'),
}: {
  isObjectExported?: boolean;
  isErrorFieldResolvable?: boolean;
  message?: string;
  tree?: FlatValidationRule['tree'];
}) => {
  const applicationAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: 'ticket-id',
      universalIdentifier: 'ticket',
      fieldIds: ['reference-id'],
    }),
    flatEntityMapsToMutate: applicationAllFlatEntityMaps.flatObjectMetadataMaps,
  });
  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatFieldMetadataMock({
      id: 'reference-id',
      universalIdentifier: 'reference',
      name: 'reference',
      objectMetadataId: 'ticket-id',
      type: FieldMetadataType.TEXT,
    }),
    flatEntityMapsToMutate: applicationAllFlatEntityMaps.flatFieldMetadataMaps,
  });
  applicationAllFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier.rule =
    {
      id: 'rule-id',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      universalIdentifier: 'rule',
      applicationUniversalIdentifier: 'application',
      objectMetadataId: 'ticket-id',
      objectMetadataUniversalIdentifier: 'ticket',
      errorFieldMetadataId: 'reference-id',
      errorFieldMetadataUniversalIdentifier: 'reference',
      name: 'Rule',
      description: null,
      icon: null,
      tree,
      message,
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
    };

  return reconstructValidationRulesManifest({
    applicationAllFlatEntityMaps,
    allFlatEntityMaps: applicationAllFlatEntityMaps,
    exportedObjectUniversalIdentifiers: new Set(
      isObjectExported ? ['ticket'] : [],
    ),
    resolvableFieldUniversalIdentifiers: new Set(
      isErrorFieldResolvable ? ['reference'] : [],
    ),
  });
};

describe('reconstructValidationRulesManifest', () => {
  it('exports a rule whose references are exported, printed with the current field names', () => {
    const { validationRules } = reconstruct({});

    expect(validationRules).toMatchObject([
      {
        universalIdentifier: 'rule',
        expression: 'isNonEmptyString(reference)',
      },
    ]);
  });

  it.each([
    ['object', { isObjectExported: false }],
    ['error field', { isErrorFieldResolvable: false }],
    ['expression', { tree: null }],
    ['message', { message: ' ' }],
    ['deleted field', { tree: readFieldTree('deleted-score') }],
  ])('leaves out a rule whose %s cannot be exported', (_, options) => {
    const { validationRules, coverage } = reconstruct(options);

    expect(validationRules).toEqual([]);
    expect(coverage).toMatchObject([
      {
        universalIdentifier: 'rule',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
      },
    ]);
  });
});
