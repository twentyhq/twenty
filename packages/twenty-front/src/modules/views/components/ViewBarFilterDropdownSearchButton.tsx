import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useOpenSearchFilter } from '@/views/hooks/useOpenSearchFilter';
import { useSearchFilterOperations } from '@/views/hooks/useSearchFilterOperations';
import { useSearchInputState } from '@/views/hooks/useSearchInputState';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownSearchButton = () => {
  const { t } = useLingui();
  const { searchInputValue } = useSearchInputState(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { applySearchFilter } = useSearchFilterOperations();
  const { openSearchFilter } = useOpenSearchFilter();

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  const handleSearchClick = () => {
    openSearchFilter();
    if (searchInputValue.length > 0) {
      applySearchFilter(searchInputValue);
    }
  };

  return (
    <SelectableListItem
      itemId={VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH}
      onEnter={handleSearchClick}
    >
      <MenuItem
        focused={isSelected}
        onClick={handleSearchClick}
        LeftIcon={IconSearch}
        text={
          <>
            {t`Search`}
            {searchInputValue && (
              <StyledSearchText>{t`· ${searchInputValue}`}</StyledSearchText>
            )}
          </>
        }
      />
    </SelectableListItem>
  );
};
