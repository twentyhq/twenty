import { getAdvancedFilterFieldMetadataItems } from '@/object-record/advanced-filter/utils/getAdvancedFilterFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';

const FILTERABLE_FIELD_METADATA_ITEMS = [
  { type: FieldMetadataType.TEXT },
  { type: FieldMetadataType.RELATION },
  { type: FieldMetadataType.SELECT },
];

describe('getAdvancedFilterFieldMetadataItems', () => {
  it('keeps every filterable field by default', () => {
    expect(
      getAdvancedFilterFieldMetadataItems({
        filterableFieldMetadataItems: FILTERABLE_FIELD_METADATA_ITEMS,
        shouldHideRelationFields: undefined,
      }),
    ).toEqual(FILTERABLE_FIELD_METADATA_ITEMS);
  });

  it('leaves relation fields out when they should be hidden', () => {
    expect(
      getAdvancedFilterFieldMetadataItems({
        filterableFieldMetadataItems: FILTERABLE_FIELD_METADATA_ITEMS,
        shouldHideRelationFields: true,
      }),
    ).toEqual([
      { type: FieldMetadataType.TEXT },
      { type: FieldMetadataType.SELECT },
    ]);
  });
});
