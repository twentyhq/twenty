import { type ViewSort } from '~/generated-metadata/graphql';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

type ViewSortComparableFields =
  | 'fieldMetadataId'
  | 'direction'
  | 'subFieldName'
  | 'relationTargetFieldMetadataId';

export const areViewSortsEqual = (
  viewSortA: Pick<ViewSort, ViewSortComparableFields>,
  viewSortB: Pick<ViewSort, ViewSortComparableFields>,
) => {
  const propertiesToCompare: ViewSortComparableFields[] = [
    'fieldMetadataId',
    'direction',
    'subFieldName',
    'relationTargetFieldMetadataId',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewSortA[property],
      viewSortB[property],
    ),
  );
};
