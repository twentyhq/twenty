import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

const StyledSearchText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

type ViewBarFilterDropdownAnyFieldSearchButtonMenuItemProps = {
  onClick?: () => void;
};

export const ViewBarFilterDropdownAnyFieldSearchButtonMenuItem = ({
  onClick,
}: ViewBarFilterDropdownAnyFieldSearchButtonMenuItemProps) => {
  const { t } = useLingui();

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const isSelected = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  return (
    <SelectableListItem
      itemId={VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH}
      onEnter={onClick}
    >
      <MenuItem
        focused={isSelected}
        onClick={onClick}
        LeftIcon={IconSearch}
        text={
          <>
            {t`Search any field`}
            {objectFilterDropdownSearchInput && (
              <StyledSearchText>{t`· ${objectFilterDropdownSearchInput}`}</StyledSearchText>
            )}
          </>
        }
      />
    </SelectableListItem>
  );
};
