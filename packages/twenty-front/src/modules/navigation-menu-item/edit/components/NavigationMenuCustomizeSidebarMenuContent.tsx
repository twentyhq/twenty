import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPaint } from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

export const NavigationMenuCustomizeSidebarMenuContent = () => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  return (
    <Dropdown.Section>
      <NavigationMenuItemSelectableItem
        item={{
          id: 'customize-sidebar',
          label: t`Customize sidebar`,
          Icon: IconPaint,
          onClick: () => {
            closeDropdown();
            enterLayoutCustomizationMode();
          },
        }}
      />
    </Dropdown.Section>
  );
};
