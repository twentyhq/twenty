import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { ANY_FIELD_SEARCH_DROPDOWN_ID } from '@/views/constants/AnyFieldSearchDropdownId';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { createContext, useContext } from 'react';

export type ViewBarFilterDropdownIdsContextValue = {
  mainDropdownId: string;
  advancedDropdownId: string;
  anyFieldSearchDropdownId: string;
  filterFieldListId: string;
  filterFieldSelectMenuScrollId: string;
  dropdownIdScope: string;
};

const DEFAULT_VIEW_BAR_FILTER_DROPDOWN_IDS = {
  mainDropdownId: ViewBarFilterDropdownIds.MAIN,
  advancedDropdownId: ViewBarFilterDropdownIds.ADVANCED,
  anyFieldSearchDropdownId: ANY_FIELD_SEARCH_DROPDOWN_ID,
  filterFieldListId: FILTER_FIELD_LIST_ID,
  filterFieldSelectMenuScrollId: 'view-bar-dropdown-filter-field-select-menu',
  dropdownIdScope: '',
} satisfies ViewBarFilterDropdownIdsContextValue;

export const ViewBarFilterDropdownIdsContext =
  createContext<ViewBarFilterDropdownIdsContextValue>(
    DEFAULT_VIEW_BAR_FILTER_DROPDOWN_IDS,
  );

export const useViewBarFilterDropdownIds = () =>
  useContext(ViewBarFilterDropdownIdsContext);
