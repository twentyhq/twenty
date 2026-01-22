import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';

describe('getTargetObjectMetadataIdsFromField', () => {
  it('should return empty array for field without morphRelations and relation', () => {
    const field = {
      type: FieldMetadataType.TEXT,
    } as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual([]);
  });

  it('should return target id from relation field', () => {
    const field = {
      type: FieldMetadataType.RELATION,
      relation: {
        targetObjectMetadata: {
          id: 'target-object-id',
        },
      },
    } as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual([
      'target-object-id',
    ]);
  });

  it('should return empty array for relation field without target', () => {
    const field = {
      type: FieldMetadataType.RELATION,
      relation: {
        targetObjectMetadata: {},
      },
    } as unknown as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual([]);
  });

  it('should return target ids from morphRelations', () => {
    const field = {
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        { targetObjectMetadata: { id: 'target-1' } },
        { targetObjectMetadata: { id: 'target-2' } },
      ],
    } as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual([
      'target-1',
      'target-2',
    ]);
  });

  it('should filter out undefined ids from morphRelations', () => {
    const field = {
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        { targetObjectMetadata: { id: 'target-1' } },
        { targetObjectMetadata: {} },
      ],
    } as unknown as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual(['target-1']);
  });

  it('should prefer morphRelations over relation', () => {
    const field = {
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [{ targetObjectMetadata: { id: 'morph-target' } }],
      relation: {
        targetObjectMetadata: {
          id: 'relation-target',
        },
      },
    } as FieldMetadataItem;

    expect(getTargetObjectMetadataIdsFromField(field)).toEqual([
      'morph-target',
    ]);
  });
});
