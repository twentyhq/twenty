import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/icon';

import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

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
      <ListItem
        focused={isSelectedItemId}
        onClick={onClick}
        startIcon={<IconSearch />}
        description={objectFilterDropdownSearchInput}
      >{t`Search any field`}</ListItem>
    </SelectableListItem>
  );
};
