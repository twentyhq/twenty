import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { ViewKey } from '@/views/types/ViewKey';

export const CommandMenuObjectViewRecordInfo = () => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();

  const processedItem =
    selectedItem && selectedItem.itemType !== NavigationMenuItemType.FOLDER
      ? selectedItem
      : undefined;

  if (!processedItem || !selectedItemLabel) {
    return null;
  }

  const isViewOrRecord =
    processedItem.itemType === NavigationMenuItemType.VIEW ||
    processedItem.itemType === NavigationMenuItemType.RECORD;
  if (!isViewOrRecord) {
    return null;
  }

  const label =
    processedItem.itemType === NavigationMenuItemType.RECORD
      ? t`record`
      : processedItem.viewKey === ViewKey.Index
        ? t`object`
        : t`view`;

  return (
    <CommandMenuPageInfoLayout
      icon={<NavigationMenuItemIcon navigationMenuItem={processedItem} />}
      title={<OverflowingTextWithTooltip text={selectedItemLabel} />}
      label={label}
    />
  );
};
