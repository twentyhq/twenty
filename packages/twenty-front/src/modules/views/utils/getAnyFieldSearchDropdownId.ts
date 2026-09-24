import { ANY_FIELD_SEARCH_DROPDOWN_ID } from '@/views/constants/AnyFieldSearchDropdownId';

export const getAnyFieldSearchDropdownId = (viewBarId: string) =>
  `${ANY_FIELD_SEARCH_DROPDOWN_ID}-${viewBarId}`;
