import { ViewFilter } from '@/views/types/ViewFilter';

export const areViewFiltersEqual = (
  viewFilterA: ViewFilter,
  viewFilterB: ViewFilter,
) => {
  const propertiesToCompare: (keyof ViewFilter)[] = [
    'fieldMetadataId',
    'viewFilterGroupId',
    'positionInViewFilterGroup',
    'value',
    'displayValue',
    'operand',
  ];

  return propertiesToCompare.every(
    (property) => viewFilterA[property] === viewFilterB[property],
  );
};
