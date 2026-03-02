import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { ViewKey } from '@/views/types/ViewKey';

export const useObjectNavItemColor = (objectNameSingular: string): string => {
  const items = useWorkspaceSectionItems();
  const objectNavItem = items.find(
    (item) =>
      'viewKey' in item &&
      item.viewKey === ViewKey.Index &&
      item.objectNameSingular === objectNameSingular,
  );
  return (
    (objectNavItem && 'color' in objectNavItem ? objectNavItem.color : null) ??
    getStandardObjectIconColor(objectNameSingular)
  );
};
