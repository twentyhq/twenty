import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';

import { MenuItemLeftContent, StyledMenuItemBase } from 'twenty-ui/navigation';

import { IconSearch } from 'twenty-ui/display';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  const { t } = useLingui();
  const [, setShowSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const [searchInputValue, setSearchInputValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const handleSearchClick = () => {
    const existingSearchFilter = currentRecordFilters.find(
      (filter) => filter.operand === ViewFilterOperand.Search,
    );

    if (!searchInputValue && isDefined(existingSearchFilter)) {
      setSearchInputValue(existingSearchFilter.value);
    }

    setShowSearchInput(true);
  };

  return (
    <StyledContainer>
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
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
