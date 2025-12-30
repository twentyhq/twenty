import { type FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

import { isSelectFieldType } from '@/command-menu/pages/page-layout/utils/isSelectFieldType';

export type SortOption = {
  value: GraphOrderBy;
  icon?: IconComponent | null;
};

type FilterSortOptionsParams = {
  options: SortOption[];
  fieldType: FieldMetadataType;
};

export const filterSortOptionsByFieldType = ({
  options,
  fieldType,
}: FilterSortOptionsParams): SortOption[] => {
  const isSelectField = isSelectFieldType(fieldType);
  const isDateField = isFieldMetadataDateKind(fieldType);

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

    if (isDateField) {
      return !isValueSort;
    }

    return true;
  });
};
