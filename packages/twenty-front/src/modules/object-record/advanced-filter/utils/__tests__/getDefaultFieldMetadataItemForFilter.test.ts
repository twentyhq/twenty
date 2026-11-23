import { getDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/utils/getDefaultFieldMetadataItemForFilter';

const FILTERABLE_FIELD_METADATA_ITEMS = [
  { id: 'created-at-field' },
  { id: 'name-field' },
];

describe('getDefaultFieldMetadataItemForFilter', () => {
  it('is the label identifier field of the object when it is filterable', () => {
    expect(
      getDefaultFieldMetadataItemForFilter({
        objectMetadataItem: { labelIdentifierFieldMetadataId: 'name-field' },
        filterableFieldMetadataItems: FILTERABLE_FIELD_METADATA_ITEMS,
      }),
    ).toEqual({ id: 'name-field' });
  });

  it('falls back to the first filterable field', () => {
    expect(
      getDefaultFieldMetadataItemForFilter({
        objectMetadataItem: { labelIdentifierFieldMetadataId: 'hidden-field' },
        filterableFieldMetadataItems: FILTERABLE_FIELD_METADATA_ITEMS,
      }),
    ).toEqual({ id: 'created-at-field' });
  });

  it('is undefined when no field is filterable', () => {
    expect(
      getDefaultFieldMetadataItemForFilter({
        objectMetadataItem: { labelIdentifierFieldMetadataId: 'name-field' },
        filterableFieldMetadataItems: [],
      }),
    ).toBeUndefined();
  });
});
