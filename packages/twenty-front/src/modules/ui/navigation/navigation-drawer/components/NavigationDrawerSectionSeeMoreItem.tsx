import { useLingui } from '@lingui/react/macro';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationDrawerSectionSeeMoreItemProps = {
  isShowingAllItems: boolean;
  onClick: () => void;
};

export const NavigationDrawerSectionSeeMoreItem = ({
  isShowingAllItems,
  onClick,
}: NavigationDrawerSectionSeeMoreItemProps) => {
  const { t } = useLingui();

  return (
    <NavigationDrawerItem
      label={isShowingAllItems ? t`See less` : t`See more`}
      Icon={isShowingAllItems ? IconChevronUp : IconChevronDown}
      variant="tertiary"
      onClick={onClick}
      triggerEvent="CLICK"
    />
  );
};
