import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { ViewKey } from '@/views/types/ViewKey';

export const CommandMenuObjectViewRecordInfo = () => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();

  const processedItem =
    selectedItem && selectedItem.itemType !== NavigationMenuItemType.FOLDER
      ? selectedItem
      : undefined;

  if (!processedItem || !selectedItemLabel) {
    return null;
  }

  const isViewOrRecord = [
    NavigationMenuItemType.VIEW,
    NavigationMenuItemType.RECORD,
  ].includes(processedItem.itemType);

  if (!isViewOrRecord) {
    return null;
  }

  const label =
    processedItem.itemType === NavigationMenuItemType.RECORD
      ? selectedItemObjectMetadata?.labelSingular
      : processedItem.viewKey === ViewKey.Index
        ? t`Object`
        : t`View`;

  return (
    <CommandMenuPageInfoLayout
      icon={<NavigationMenuItemIcon navigationMenuItem={processedItem} />}
      title={<OverflowingTextWithTooltip text={selectedItemLabel} />}
      label={label}
    />
  );
};
