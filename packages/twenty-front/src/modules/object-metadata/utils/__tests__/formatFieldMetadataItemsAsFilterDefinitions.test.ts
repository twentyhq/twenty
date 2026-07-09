import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationObjectMetadataNameSingular } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';

describe('getRelationObjectMetadataNameSingular', () => {
  it('should return relation target object metadata singular name', () => {
    const field = {
      type: FieldMetadataType.RELATION,
      relation: {
        targetObjectMetadata: {
          nameSingular: 'company',
        },
      },
    } as FieldMetadataItem;

    expect(getRelationObjectMetadataNameSingular({ field })).toBe('company');
  });

  it('should return first morph relation target object metadata singular name', () => {
    const field = {
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        {
          targetObjectMetadata: {
            nameSingular: 'opportunity',
          },
        },
        {
          targetObjectMetadata: {
            nameSingular: 'person',
          },
        },
      ],
    } as FieldMetadataItem;

    expect(getRelationObjectMetadataNameSingular({ field })).toBe('opportunity');
  });

  it('should prefer morph relation target when both relation and morph relations are defined', () => {
    const field = {
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        {
          targetObjectMetadata: {
            nameSingular: 'opportunity',
          },
        },
      ],
      relation: {
        targetObjectMetadata: {
          nameSingular: 'company',
        },
      },
    } as FieldMetadataItem;

    expect(getRelationObjectMetadataNameSingular({ field })).toBe('opportunity');
  });

  it('should return undefined when relation metadata is missing', () => {
    const field = {
      type: FieldMetadataType.RELATION,
      relation: {
        targetObjectMetadata: {},
      },
    } as unknown as FieldMetadataItem;

    expect(getRelationObjectMetadataNameSingular({ field })).toBeUndefined();
  });
});
