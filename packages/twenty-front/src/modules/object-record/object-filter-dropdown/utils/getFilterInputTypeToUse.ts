import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterInputType } from '@/object-record/object-filter-dropdown/types/FilterInputType';
import { isActorSourceCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isActorSourceCompositeFilter';
import { isCurrencyCodeCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isCurrencyCodeCompositeFilter';

export const getFilterInputTypeToUse = (
  filterDefinition: FilterDefinition,
): FilterInputType => {
  console.log({
    filterDefinition,
    true: isCurrencyCodeCompositeFilter(filterDefinition),
  });
  if (
    (TEXT_FILTER_TYPES.includes(filterDefinition.type) &&
      !isActorSourceCompositeFilter(filterDefinition)) ||
    isCurrencyCodeCompositeFilter(filterDefinition)
  ) {
    return 'text';
  } else if (NUMBER_FILTER_TYPES.includes(filterDefinition.type)) {
    return 'number';
  } else if (filterDefinition.type === 'RATING') {
    return 'rating';
  } else if (DATE_FILTER_TYPES.includes(filterDefinition.type)) {
    return 'date';
  } else if (filterDefinition.type === 'RELATION') {
    return 'relation';
  } else if (isActorSourceCompositeFilter(filterDefinition)) {
    return 'source';
  } else if (filterDefinition.type === 'SELECT') {
    return 'select';
  } else {
    throw new Error(
      `Filter type ${filterDefinition.type} is not supported in the filter dropdown`,
    );
  }
};
