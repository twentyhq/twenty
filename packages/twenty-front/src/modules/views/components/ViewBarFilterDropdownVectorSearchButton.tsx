import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';

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
  const [, setVectorSearchInputValue] = useRecoilComponentState(
    vectorSearchInputComponentState,
  );
  const { setVectorSearchInputValueFromExistingFilter } =
    useSetVectorSearchInputValueFromExistingFilter();

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const { applyVectorSearchFilter } = useVectorSearchFilterActions();
  const { openVectorSearchFilter } = useOpenVectorSearchFilter();

  const isSelected = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  const handleSearchClick = () => {
    openVectorSearchFilter();

    if (objectFilterDropdownSearchInput.length > 0) {
      setVectorSearchInputValue(objectFilterDropdownSearchInput);
      applyVectorSearchFilter(objectFilterDropdownSearchInput);
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
            {objectFilterDropdownSearchInput && (
              <StyledSearchText>{t`· ${objectFilterDropdownSearchInput}`}</StyledSearchText>
            )}
          </>
        }
      />
    </SelectableListItem>
  );
};
