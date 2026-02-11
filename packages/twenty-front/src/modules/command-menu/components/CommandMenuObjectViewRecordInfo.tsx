import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { ViewKey } from '@/views/types/ViewKey';

export const CommandMenuObjectViewRecordInfo = () => {
  const { t } = useLingui();
  const { processedItem, selectedItemLabel } =
    useSelectedNavigationMenuItemEditData();

  if (!processedItem || !selectedItemLabel) {
    return null;
  }

  const isViewOrRecord =
    processedItem.itemType === 'view' || processedItem.itemType === 'record';
  if (!isViewOrRecord) {
    return null;
  }

  const label =
    processedItem.itemType === 'record'
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
