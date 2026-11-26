import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationMenuSectionSeeMoreProps = {
  isShowingAllItems: boolean;
  onToggle: () => void;
  hiddenItems: ReactNode;
};

export const NavigationMenuSectionSeeMore = ({
  isShowingAllItems,
  onToggle,
  hiddenItems,
}: NavigationMenuSectionSeeMoreProps) => {
  const { t } = useLingui();

  return (
    <Collapsible.Root open={isShowingAllItems}>
      <Collapsible.Panel dimension="height">{hiddenItems}</Collapsible.Panel>
      <NavigationDrawerItem
        label={isShowingAllItems ? t`See less` : t`See more`}
        Icon={isShowingAllItems ? IconChevronUp : IconChevronDown}
        variant="tertiary"
        preventCollapseOnMobile
        triggerEvent="CLICK"
        onClick={onToggle}
      />
    </Collapsible.Root>
  );
};
