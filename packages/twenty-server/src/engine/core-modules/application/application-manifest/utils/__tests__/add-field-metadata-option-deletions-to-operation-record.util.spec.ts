import { addFieldMetadataOptionDeletionsToOperationRecord } from 'src/engine/core-modules/application/application-manifest/utils/add-field-metadata-option-deletions-to-operation-record.util';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';

const buildFlatFieldMetadataOption = (
  universalIdentifier: string,
): FlatFieldMetadataOption => ({
  id: universalIdentifier,
  workspaceId: '20202020-0000-4000-8000-0000000000ff',
  universalIdentifier,
  applicationId: '20202020-0000-4000-8000-0000000000bb',
  applicationUniversalIdentifier: '20202020-0000-4000-8000-0000000000bb',
  fieldMetadataId: '20202020-0000-4000-8000-000000000001',
  fieldMetadataUniversalIdentifier: '20202020-0000-4000-8000-000000000001',
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
  isActive: true,
  overrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('addFieldMetadataOptionDeletionsToOperationRecord', () => {
  it('returns the record unchanged when there is nothing to delete', () => {
    const allFlatEntityOperationRecordByMetadataName = {};

    expect(
      addFieldMetadataOptionDeletionsToOperationRecord({
        allFlatEntityOperationRecordByMetadataName,
        flatFieldMetadataOptionsToDelete: [],
      }),
    ).toBe(allFlatEntityOperationRecordByMetadataName);
  });

  it('adds the deletions next to the existing option operations', () => {
    const appCreatedOption = buildFlatFieldMetadataOption(
      '20202020-0000-4000-8000-000000000101',
    );
    const appDeletedOption = buildFlatFieldMetadataOption(
      '20202020-0000-4000-8000-000000000102',
    );
    const foreignOption = buildFlatFieldMetadataOption(
      '20202020-0000-4000-8000-000000000201',
    );

    expect(
      addFieldMetadataOptionDeletionsToOperationRecord({
        allFlatEntityOperationRecordByMetadataName: {
          fieldMetadataOption: {
            flatEntityToCreate: {
              [appCreatedOption.universalIdentifier]: appCreatedOption,
            },
            flatEntityToUpdate: {},
            flatEntityToDelete: {
              [appDeletedOption.universalIdentifier]: appDeletedOption,
            },
          },
        },
        flatFieldMetadataOptionsToDelete: [foreignOption],
      }),
    ).toEqual({
      fieldMetadataOption: {
        flatEntityToCreate: {
          [appCreatedOption.universalIdentifier]: appCreatedOption,
        },
        flatEntityToUpdate: {},
        flatEntityToDelete: {
          [appDeletedOption.universalIdentifier]: appDeletedOption,
          [foreignOption.universalIdentifier]: foreignOption,
        },
      },
    });
  });
});
