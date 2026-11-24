import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationMenuItemSelectableItemProps = { item: NavigationMenuItemOption };

export const NavigationMenuItemSelectableItem = ({
  item,
}: NavigationMenuItemSelectableItemProps) => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const alreadyAddedText = isCustomizableSidebarEnabled
    ? t`Already in this section`
    : t`Already in sidebar`;

  return (
    <Dropdown.OptionItem
      color={item.accent === 'danger' ? 'danger' : 'neutral'}
      startIcon={
        <>
          <SelectOptionIcon Icon={item.Icon} />
          {item.icon}
        </>
      }
      onSelect={item.onClick}
      closeOnSelect={!item.hasSubMenu}
      disabled={item.isDisabled}
      description={
        item.isAlreadyInSidebar ? alreadyAddedText : item.contextualText
      }
      hasSubmenu={item.hasSubMenu}
    >
      {item.label}
    </Dropdown.OptionItem>
  );
};
