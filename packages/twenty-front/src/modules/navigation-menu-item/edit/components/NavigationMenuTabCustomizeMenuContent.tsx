import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconTool } from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';

type NavigationMenuTabCustomizeMenuContentProps = {
  onClose: () => void;
};

export const NavigationMenuTabCustomizeMenuContent = ({
  onClose,
}: NavigationMenuTabCustomizeMenuContentProps) => {
  const { t } = useLingui();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  return (
    <Dropdown.Section>
      <NavigationMenuItemSelectableItem
        item={{
          id: 'customize',
          label: t`Customize sidebar`,
          Icon: IconTool,
          onClick: () => {
            onClose();
            enterLayoutCustomizationMode();
          },
        }}
      />
    </Dropdown.Section>
  );
};
