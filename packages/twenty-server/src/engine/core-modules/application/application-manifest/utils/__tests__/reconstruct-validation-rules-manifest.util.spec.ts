/* @license Enterprise */

import { reconstructValidationRulesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-validation-rules-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { FieldMetadataType } from 'twenty-shared/types';

const NOW = '2026-11-02T00:00:00.000Z';

const reconstruct = ({
  isObjectExported = true,
  isErrorFieldResolvable = true,
}: {
  isObjectExported?: boolean;
  isErrorFieldResolvable?: boolean;
}) => {
  const applicationAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

  applicationAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier.ticket =
    getFlatObjectMetadataMock({ universalIdentifier: 'ticket' });
  applicationAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier.reference =
    getFlatFieldMetadataMock({
      universalIdentifier: 'reference',
      objectMetadataId: 'ticket-id',
      type: FieldMetadataType.TEXT,
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
      expression: 'isNonEmptyString(reference)',
      bindings: { reference: 'reference' },
      message: 'Message',
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
  it('exports a rule whose references are exported', () => {
    const { validationRules } = reconstruct({});

    expect(validationRules).toMatchObject([{ universalIdentifier: 'rule' }]);
  });

  it.each([
    ['object', { isObjectExported: false }],
    ['error field', { isErrorFieldResolvable: false }],
  ])('leaves out a rule whose %s is not exported', (_, options) => {
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
