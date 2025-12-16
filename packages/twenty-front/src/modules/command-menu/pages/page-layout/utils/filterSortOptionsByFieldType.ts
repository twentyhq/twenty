import { type IconComponent } from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export type SortOption = {
  value: GraphOrderBy;
  icon?: IconComponent | null;
};

type FilterSortOptionsParams = {
  options: SortOption[];
  isSelectField: boolean;
  isDateField?: boolean;
  chartType: 'bar' | 'line' | 'pie';
};

export const filterSortOptionsByFieldType = ({
  options,
  isSelectField,
  isDateField = false,
  chartType,
}: FilterSortOptionsParams): SortOption[] => {
  return options.filter((option) => {
    const isValueSort =
      option.value === GraphOrderBy.VALUE_ASC ||
      option.value === GraphOrderBy.VALUE_DESC;

    const isManualSort = option.value === GraphOrderBy.MANUAL;

    const isPositionSort =
      option.value === GraphOrderBy.FIELD_POSITION_ASC ||
      option.value === GraphOrderBy.FIELD_POSITION_DESC;

    if (isManualSort && !isSelectField) {
      return false;
    }

    if (isPositionSort && !isSelectField) {
      return false;
    }

    if (chartType === 'line') {
      return !isValueSort;
    }

    if ((chartType === 'bar' || chartType === 'pie') && isDateField) {
      return !isValueSort;
    }

    return true;
  });
};
