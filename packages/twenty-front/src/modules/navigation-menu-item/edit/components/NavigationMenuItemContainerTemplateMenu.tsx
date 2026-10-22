import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCode, IconPlus } from 'twenty-ui/icon';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemContainerTemplate } from '@/navigation-menu-item/edit/types/NavigationMenuItemContainerTemplate';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemContainerTemplateMenuProps = {
  dropdownId: string;
  title: string;
  blankLabel: string;
  trigger: ReactElement;
  isTriggerNativeButton?: boolean;
  side?: 'right' | 'bottom';
  onSelect: (template: NavigationMenuItemContainerTemplate) => void;
};

export const NavigationMenuItemContainerTemplateMenu = ({
  dropdownId,
  title,
  blankLabel,
  trigger,
  isTriggerNativeButton = true,
  side = 'right',
  onSelect,
}: NavigationMenuItemContainerTemplateMenuProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger nativeButton={isTriggerNativeButton} render={trigger} />
      <DropdownContent
        side={side}
        align="start"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={title}
      >
        <Dropdown.Section>
          <NavigationMenuItemSelectableItem
            item={{
              id: 'blank',
              label: blankLabel,
              Icon: IconPlus,
              onClick: () => onSelect('blank'),
            }}
          />
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section label={t`Templates`}>
          <NavigationMenuItemSelectableItem
            item={{
              id: 'developer-tools',
              label: t`Developers`,
              contextualText: t`API, webhooks, apps, CLI and logs`,
              Icon: IconCode,
              onClick: () => onSelect('developer-tools'),
            }}
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
