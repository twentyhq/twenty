import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useOpenVectorSearchFilter } from '@/views/hooks/useOpenVectorSearchFilter';
import { useVectorSearchFilterOperations } from '@/views/hooks/useVectorSearchFilterOperations';
import { useVectorSearchInputState } from '@/views/hooks/useVectorSearchInputState';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownVectorSearchButton = () => {
  const { t } = useLingui();
  const { vectorSearchInputValue } = useVectorSearchInputState(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const { applyVectorSearchFilter } = useVectorSearchFilterOperations();
  const { openVectorSearchFilter } = useOpenVectorSearchFilter();

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  const handleSearchClick = () => {
    openVectorSearchFilter();
    if (vectorSearchInputValue.length > 0) {
      applyVectorSearchFilter(vectorSearchInputValue);
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
            {vectorSearchInputValue && (
              <StyledSearchText>{t`· ${vectorSearchInputValue}`}</StyledSearchText>
            )}
          </>
        }
      />
    </SelectableListItem>
  );
};
