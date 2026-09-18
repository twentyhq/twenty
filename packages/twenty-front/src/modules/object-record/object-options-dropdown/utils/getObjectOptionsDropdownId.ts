import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';

export const getObjectOptionsDropdownId = (recordIndexId: string) =>
  `${OBJECT_OPTIONS_DROPDOWN_ID}-${recordIndexId}`;
