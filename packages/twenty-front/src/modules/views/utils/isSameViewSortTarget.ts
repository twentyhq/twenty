import { type ViewSort } from '@/views/types/ViewSort';

export const isSameViewSortTarget = (
  viewSortA: Pick<ViewSort, 'fieldMetadataId' | 'direction'>,
  viewSortB: Pick<ViewSort, 'fieldMetadataId' | 'direction'>,
): boolean =>
  viewSortA.fieldMetadataId === viewSortB.fieldMetadataId &&
  viewSortA.direction === viewSortB.direction;
