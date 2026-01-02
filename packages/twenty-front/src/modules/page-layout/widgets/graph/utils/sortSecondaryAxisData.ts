import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortSecondaryAxisDataParams<T> = {
  items: T[];
  orderBy?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup?: Map<string, RawDimensionValue>;
  selectFieldOptions?: FieldMetadataItemOption[] | null;
  getFormattedValue: (item: T) => string;
};

export const sortSecondaryAxisData = <T>({
  items,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  selectFieldOptions,
  getFormattedValue,
}: SortSecondaryAxisDataParams<T>): T[] => {
  switch (orderBy) {
    case GraphOrderBy.FIELD_ASC:
      return items.toSorted((a, b) =>
        getFormattedValue(a).localeCompare(getFormattedValue(b)),
      );

    case GraphOrderBy.FIELD_DESC:
      return items.toSorted((a, b) =>
        getFormattedValue(b).localeCompare(getFormattedValue(a)),
      );

    case GraphOrderBy.FIELD_POSITION_ASC:
    case GraphOrderBy.FIELD_POSITION_DESC: {
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        throw new Error(
          'Select field options and formatted to raw lookup are required',
        );
      }

      return sortBySelectOptionPosition({
        items,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue,
        direction: orderBy === GraphOrderBy.FIELD_POSITION_ASC ? 'ASC' : 'DESC',
      });
    }

    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return items;
      }

      return sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => {
          const formattedValue = getFormattedValue(item);
          const rawValue = formattedToRawLookup?.get(formattedValue);

          return isDefined(rawValue) ? String(rawValue) : formattedValue;
        },
      });
    }

    default:
      return items;
  }
};
