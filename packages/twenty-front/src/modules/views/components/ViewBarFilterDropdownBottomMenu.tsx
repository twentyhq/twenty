import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';

import { MenuItemLeftContent, StyledMenuItemBase } from 'twenty-ui/navigation';

import { IconSearch } from 'twenty-ui/display';

import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  const { t } = useLingui();
  const [, setShowSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  return (
    <StyledContainer>
      <StyledMenuItemBase onClick={() => setShowSearchInput(true)}>
        <MenuItemLeftContent LeftIcon={IconSearch} text={t`Search`} />
      </StyledMenuItemBase>
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
