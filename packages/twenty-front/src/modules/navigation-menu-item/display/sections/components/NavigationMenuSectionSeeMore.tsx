import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';

import { isNavigationMenuSectionShowingAllItemsFamilyState } from '@/navigation-menu-item/common/states/isNavigationMenuSectionShowingAllItemsFamilyState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type NavigationMenuSectionSeeMoreProps = {
  sectionId: string;
  hiddenItems: ReactNode;
};

export const NavigationMenuSectionSeeMore = ({
  sectionId,
  hiddenItems,
}: NavigationMenuSectionSeeMoreProps) => {
  const { t } = useLingui();
  const [isShowingAllItems, setIsShowingAllItems] = useAtomFamilyState(
    isNavigationMenuSectionShowingAllItemsFamilyState,
    sectionId,
  );

  return (
    <Collapsible.Root open={isShowingAllItems}>
      <Collapsible.Panel dimension="height">{hiddenItems}</Collapsible.Panel>
      <NavigationDrawerItem
        label={isShowingAllItems ? t`See less` : t`See more`}
        Icon={isShowingAllItems ? IconChevronUp : IconChevronDown}
        variant="tertiary"
        preventCollapseOnMobile
        triggerEvent="CLICK"
        onClick={() => setIsShowingAllItems(!isShowingAllItems)}
      />
    </Collapsible.Root>
  );
};
