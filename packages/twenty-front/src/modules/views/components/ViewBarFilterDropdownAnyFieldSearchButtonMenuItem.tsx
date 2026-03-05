import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

const StyledSearchText = styled.span`
  color: ${themeCssVariables.font.color.light};
  margin-left: ${themeCssVariables.spacing[1]};
`;

type ViewBarFilterDropdownAnyFieldSearchButtonMenuItemProps = {
  onClick?: () => void;
};

export const ViewBarFilterDropdownAnyFieldSearchButtonMenuItem = ({
  onClick,
}: ViewBarFilterDropdownAnyFieldSearchButtonMenuItemProps) => {
  const { t } = useLingui();

  const objectFilterDropdownSearchInput = useAtomComponentStateValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
  );

  return (
    <SelectableListItem
      itemId={VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH}
      onEnter={onClick}
    >
      <MenuItem
        focused={isSelectedItemId}
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
