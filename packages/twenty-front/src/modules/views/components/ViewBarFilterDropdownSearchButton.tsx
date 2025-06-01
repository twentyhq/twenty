import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useSearchFilter } from '@/views/hooks/useSearchFilter';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const SEARCH_BUTTON_ID = 'search-button';

export const ViewBarFilterDropdownSearchButton = () => {
  const { t } = useLingui();
  const { searchInputValue, setShowSearchInput, applySearchFilter } =
    useSearchFilter(VIEW_BAR_FILTER_DROPDOWN_ID);

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    SEARCH_BUTTON_ID,
  );

  const handleSearchClick = () => {
    setShowSearchInput(true);
    if (searchInputValue.length > 0) {
      applySearchFilter(searchInputValue);
    }
  };

  return (
    <SelectableListItem itemId={SEARCH_BUTTON_ID} onEnter={handleSearchClick}>
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
