import { ViewFilter } from '@/views/types/ViewFilter';

export const areViewFiltersEqual = (
  viewFilterA: ViewFilter,
  viewFilterB: ViewFilter,
) => {
  const propertiesToCompare: (keyof ViewFilter)[] = [
    'displayValue',
    'fieldMetadataId',
    'viewFilterGroupId',
    'operand',
    'positionInViewFilterGroup',
    'value',
  ];

  return propertiesToCompare.every(
    (property) => viewFilterA[property] === viewFilterB[property],
  );
};
