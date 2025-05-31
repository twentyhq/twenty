import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItemLeftContent, StyledMenuItemBase } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useSearchFilter } from '@/views/hooks/useSearchFilter';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownSearchButton = () => {
  const { t } = useLingui();
  const {
    searchInputValue,
    setShowSearchInput,
    setSearchInputValueFromExistingFilter,
    applySearchFilter,
  } = useSearchFilter(VIEW_BAR_FILTER_DROPDOWN_ID);

  const handleSearchClick = () => {
    setSearchInputValueFromExistingFilter();
    setShowSearchInput(true);
    if (searchInputValue.length > 0) {
      applySearchFilter(searchInputValue);
    }
  };

  return (
    <StyledMenuItemBase onClick={handleSearchClick}>
      <MenuItemLeftContent
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
    </StyledMenuItemBase>
  );
};
