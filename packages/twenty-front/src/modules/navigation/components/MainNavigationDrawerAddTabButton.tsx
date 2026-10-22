import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';

import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const { createTab } = useCreateNavigationMenuTabOrSection();

  return (
    <NavigationMenuItemContainerTemplateMenu
      dropdownId="navigation-menu-add-tab"
      title={t`Add tab`}
      blankLabel={t`Blank tab`}
      side={isExpanded ? 'bottom' : 'right'}
      trigger={
        <LightIconButton
          emphasis="subtle"
          size={isExpanded ? 'sm' : 'md'}
          aria-label={t`Add tab`}
        >
          <IconPlus />
        </LightIconButton>
      }
      onSelect={createTab}
    />
  );
};
