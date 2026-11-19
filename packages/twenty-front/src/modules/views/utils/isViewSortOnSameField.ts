import { type ViewSort } from '@/views/types/ViewSort';

// The server allows one sort per field and view, whatever its direction or sub-field
export const isViewSortOnSameField = (
  viewSortA: Pick<ViewSort, 'fieldMetadataId'>,
  viewSortB: Pick<ViewSort, 'fieldMetadataId'>,
): boolean => viewSortA.fieldMetadataId === viewSortB.fieldMetadataId;
