import { type ViewSort } from '@/views/types/ViewSort';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

type ViewSortTarget = Pick<
  ViewSort,
  'fieldMetadataId' | 'direction' | 'subFieldName'
>;

export const isSameViewSortTarget = (
  viewSortA: ViewSortTarget,
  viewSortB: ViewSortTarget,
): boolean =>
  viewSortA.fieldMetadataId === viewSortB.fieldMetadataId &&
  viewSortA.direction === viewSortB.direction &&
  compareStrictlyExceptForNullAndUndefined(
    viewSortA.subFieldName,
    viewSortB.subFieldName,
  );
