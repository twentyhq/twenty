import { type ViewFilter } from '@/views/types/ViewFilter';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

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
    'subFieldName',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewFilterA[property],
      viewFilterB[property],
    ),
  );
};
