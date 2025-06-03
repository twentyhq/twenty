import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useOpenVectorSearchFilter } from '@/views/hooks/useOpenVectorSearchFilter';
import { useSetVectorSearchInputValueFromExistingFilter } from '@/views/hooks/useSetVectorSearchInputValueFromExistingFilter';
import { useVectorSearchFilterActions } from '@/views/hooks/useVectorSearchFilterActions';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownVectorSearchButton = () => {
  const { t } = useLingui();
  const [, setVectorSearchInputValue] = useRecoilComponentStateV2(
    vectorSearchInputComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const { setVectorSearchInputValueFromExistingFilter } =
    useSetVectorSearchInputValueFromExistingFilter(VIEW_BAR_FILTER_DROPDOWN_ID);

  const fieldSearchInputValue = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const { applyVectorSearchFilter } = useVectorSearchFilterActions();
  const { openVectorSearchFilter } = useOpenVectorSearchFilter(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  const handleSearchClick = () => {
    openVectorSearchFilter();

    if (fieldSearchInputValue.length > 0) {
      setVectorSearchInputValue(fieldSearchInputValue);
      applyVectorSearchFilter(fieldSearchInputValue);
    } else {
      setVectorSearchInputValueFromExistingFilter();
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
            {fieldSearchInputValue && (
              <StyledSearchText>{t`· ${fieldSearchInputValue}`}</StyledSearchText>
            )}
          </>
        }
      />
    </SelectableListItem>
  );
};
