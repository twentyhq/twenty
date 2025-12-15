import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export const getSortedKeys = ({
  orderByY,
  yValues,
  manualSortOrder,
  formattedToRawLookup,
  selectFieldOptions,
}: {
  orderByY?: GraphOrderBy | null;
  yValues: string[];
  manualSortOrder?: string[] | null;
  formattedToRawLookup?: Map<string, RawDimensionValue>;
  selectFieldOptions?: FieldMetadataItemOption[] | null;
}) => {
  switch (orderByY) {
    case GraphOrderBy.FIELD_ASC:
      return Array.from(yValues).sort((a, b) => a.localeCompare(b));
    case GraphOrderBy.FIELD_DESC:
      return Array.from(yValues).sort((a, b) => b.localeCompare(a));
    case GraphOrderBy.FIELD_POSITION_ASC:
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        throw new Error('Select field options are required');
      }

      return sortBySelectOptionPosition({
        items: Array.from(yValues),
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item,
        direction: 'ASC',
      });
    case GraphOrderBy.FIELD_POSITION_DESC:
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        throw new Error('Select field options are required');
      }

      return sortBySelectOptionPosition({
        items: Array.from(yValues),
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item,
        direction: 'DESC',
      });
    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return yValues;
      }

      const sortedKeys = sortByManualOrder({
        items: yValues,
        manualSortOrder,
        getRawValue: (formattedValue) => {
          const rawValue = formattedToRawLookup?.get(formattedValue);

          return isDefined(rawValue) ? String(rawValue) : formattedValue;
        },
      });

      return sortedKeys;
    }
    default:
      return yValues;
  }
};
