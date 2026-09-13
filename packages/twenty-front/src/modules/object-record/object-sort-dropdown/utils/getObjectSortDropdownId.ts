import { OBJECT_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ObjectSortDropdownId';

export const getObjectSortDropdownId = (recordIndexId: string) =>
  `${OBJECT_SORT_DROPDOWN_ID}-${recordIndexId}`;
