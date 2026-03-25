import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemLabel } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemLabel';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';

export const SidePanelObjectViewRecordInfo = () => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemLabel } = useSelectedNavigationMenuItemEditItemLabel();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();

  const navItem =
    selectedItem && selectedItem.type !== NavigationMenuItemType.FOLDER
      ? selectedItem
      : undefined;

  if (!navItem || !selectedItemLabel) {
    return null;
  }

  const isObjectViewOrRecord = [
    NavigationMenuItemType.OBJECT,
    NavigationMenuItemType.VIEW,
    NavigationMenuItemType.RECORD,
  ].includes(navItem.type);

  if (!isObjectViewOrRecord) {
    return null;
  }

  const label =
    navItem.type === NavigationMenuItemType.RECORD
      ? selectedItemObjectMetadata?.labelSingular
      : navItem.type === NavigationMenuItemType.OBJECT
        ? t`Object`
        : t`View`;

  return (
    <SidePanelPageInfoLayout
      icon={<NavigationMenuItemIcon navigationMenuItem={navItem} />}
      title={<OverflowingTextWithTooltip text={selectedItemLabel} />}
      label={label}
    />
  );
};
