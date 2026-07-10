import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { cleanMorphRelationsTargetingObjectMetadataId } from '@/metadata-store/utils/cleanMorphRelationsTargetingObjectMetadataId';

const buildMorphRelation = (targetObjectMetadataId: string) =>
  ({
    targetObjectMetadata: {
      id: targetObjectMetadataId,
      nameSingular: targetObjectMetadataId,
      namePlural: `${targetObjectMetadataId}s`,
    },
  }) as unknown as NonNullable<FlatFieldMetadataItem['morphRelations']>[number];

const buildField = (
  id: string,
  morphRelations: FlatFieldMetadataItem['morphRelations'],
): FlatFieldMetadataItem =>
  ({
    id,
    name: id,
    objectMetadataId: 'source-object',
    morphRelations,
  }) as unknown as FlatFieldMetadataItem;

describe('cleanMorphRelationsTargetingObjectMetadataId', () => {
  it('should remove morph relations targeting the deleted object and return only changed fields', () => {
    const morphField = buildField('morph-field', [
      buildMorphRelation('company-id'),
      buildMorphRelation('meeting-id'),
    ]);
    const untouchedField = buildField('other-morph-field', [
      buildMorphRelation('company-id'),
    ]);
    const nonMorphField = buildField('text-field', null);

    const result = cleanMorphRelationsTargetingObjectMetadataId(
      [morphField, untouchedField, nonMorphField],
      'meeting-id',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('morph-field');
    expect(result[0].morphRelations).toEqual([
      buildMorphRelation('company-id'),
    ]);
  });

  it('should keep a morph field with an empty morphRelations array when all its targets are deleted', () => {
    const result = cleanMorphRelationsTargetingObjectMetadataId(
      [buildField('exclusive-morph', [buildMorphRelation('meeting-id')])],
      'meeting-id',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('exclusive-morph');
    expect(result[0].morphRelations).toEqual([]);
  });

  it('should return an empty array when no morph relation targets the deleted object', () => {
    const result = cleanMorphRelationsTargetingObjectMetadataId(
      [buildField('morph-field', [buildMorphRelation('company-id')])],
      'meeting-id',
    );

    expect(result).toEqual([]);
  });
});
