import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { deleteUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-foreign-key-aggregators.util';

describe('deleteUniversalFlatEntityForeignKeyAggregators', () => {
  it('should delete all aggregator keys from the entity', () => {
    const objectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'object-1',
      fieldUniversalIdentifiers: ['field-1', 'field-2'],
      viewUniversalIdentifiers: ['view-1'],
      indexMetadataUniversalIdentifiers: ['index-1'],
    });

    const result = deleteUniversalFlatEntityForeignKeyAggregators({
      universalFlatEntity: objectMetadata,
      metadataName: 'objectMetadata',
    });

    expect(result).not.toHaveProperty('fieldUniversalIdentifiers');
    expect(result).not.toHaveProperty('viewUniversalIdentifiers');
    expect(result).not.toHaveProperty('indexMetadataUniversalIdentifiers');
    expect(result.universalIdentifier).toBe('object-1');
  });

  it('should return the same reference for metadata with no aggregators', () => {
    const entity = getFlatObjectMetadataMock({
      universalIdentifier: 'logic-1',
    });

    const result = deleteUniversalFlatEntityForeignKeyAggregators({
      universalFlatEntity: entity,
      metadataName: 'logicFunction' as any,
    });

    expect(result).toBe(entity);
  });
});
