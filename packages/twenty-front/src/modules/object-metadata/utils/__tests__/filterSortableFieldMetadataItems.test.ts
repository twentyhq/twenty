import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

describe('filterSortableFieldMetadataItems', () => {
  it('should allow TEXT field type', () => {
    const field = {
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
      isSystem: false,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(true);
  });

  it('should allow NUMBER field type', () => {
    const field = {
      id: 'field-1',
      name: 'count',
      type: FieldMetadataType.NUMBER,
      isSystem: false,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(true);
  });

  it('should allow DATE_TIME field type', () => {
    const field = {
      id: 'field-1',
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      isSystem: false,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(true);
  });

  it('should allow MANY_TO_ONE relation field type', () => {
    const field = {
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
      isSystem: false,
      isActive: true,
      relation: {
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadata: {
          nameSingular: 'company',
        },
      },
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(true);
  });

  it('should NOT allow ONE_TO_MANY relation field type', () => {
    const field = {
      id: 'field-1',
      name: 'people',
      type: FieldMetadataType.RELATION,
      isSystem: false,
      isActive: true,
      relation: {
        type: RelationType.ONE_TO_MANY,
        targetObjectMetadata: {
          nameSingular: 'person',
        },
      },
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(false);
  });

  it('should NOT allow RELATION field without relation property', () => {
    const field = {
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
      isSystem: false,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(false);
  });

  it('should NOT allow system fields', () => {
    const field = {
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
      isSystem: true,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(false);
  });

  it('should NOT allow inactive fields', () => {
    const field = {
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
      isSystem: false,
      isActive: false,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(false);
  });

  it('should NOT allow unsortable field types like RICH_TEXT', () => {
    const field = {
      id: 'field-1',
      name: 'description',
      type: FieldMetadataType.RICH_TEXT,
      isSystem: false,
      isActive: true,
    };

    expect(filterSortableFieldMetadataItems(field as any)).toBe(false);
  });
});

