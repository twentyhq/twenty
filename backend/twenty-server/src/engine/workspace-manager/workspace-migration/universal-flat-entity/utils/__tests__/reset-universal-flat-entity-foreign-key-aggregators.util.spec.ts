import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resetUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';

describe('resetUniversalFlatEntityForeignKeyAggregators', () => {
  it('should reset aggregator properties to empty arrays for objectMetadata', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'object-1',
      fieldUniversalIdentifiers: ['field-1', 'field-2'],
      viewUniversalIdentifiers: ['view-1'],
      indexMetadataUniversalIdentifiers: ['index-1'],
    });

    const result = resetUniversalFlatEntityForeignKeyAggregators({
      universalFlatEntity: objectMetadata,
      metadataName: 'objectMetadata',
    });

    expect(result).toMatchObject({
      fieldUniversalIdentifiers: [],
      viewUniversalIdentifiers: [],
      indexMetadataUniversalIdentifiers: [],
    });
  });

  it('should reset aggregator properties to empty arrays for fieldMetadata', () => {
    const fieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: 'field-1',
      objectMetadataId: 'object-1',
      type: FieldMetadataType.TEXT,
      viewFieldUniversalIdentifiers: ['vf-1'],
      viewFilterUniversalIdentifiers: ['filter-1'],
    });

    const result = resetUniversalFlatEntityForeignKeyAggregators({
      universalFlatEntity: fieldMetadata,
      metadataName: 'fieldMetadata',
    });

    expect(result).toMatchObject({
      viewFieldUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      calendarViewUniversalIdentifiers: [],
      kanbanAggregateOperationViewUniversalIdentifiers: [],
      mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    });
  });
});
