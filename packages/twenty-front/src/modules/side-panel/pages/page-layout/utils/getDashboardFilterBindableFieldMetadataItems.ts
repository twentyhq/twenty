import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE } from 'twenty-shared/constants';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { type PageLayoutFilterType } from '~/generated-metadata/graphql';

export const getDashboardFilterBindableFieldMetadataItems = <
  TFieldMetadataItem extends Pick<
    FieldMetadataItem,
    'name' | 'type' | 'isActive'
  >,
>({
  fieldMetadataItems,
  pageLayoutFilterType,
}: {
  fieldMetadataItems: TFieldMetadataItem[];
  pageLayoutFilterType: PageLayoutFilterType;
}): TFieldMetadataItem[] => {
  const bindableFieldFilterTypes =
    BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE[
      pageLayoutFilterType
    ];

  return fieldMetadataItems.filter(
    ({ name, type, isActive }) =>
      isActive &&
      name !== SOFT_DELETE_FILTER_FIELD_NAME &&
      bindableFieldFilterTypes.some(
        (bindableFieldFilterType) =>
          bindableFieldFilterType === getFilterTypeFromFieldType(type),
      ),
  );
};
