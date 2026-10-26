import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';

import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
  isTooltipDisabled: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
  isTooltipDisabled,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const { createTab } = useCreateNavigationMenuTabOrSection();

  return (
    <MainNavigationDrawerModeButton
      Icon={IconPlus}
      label={t`Add tab`}
      tooltip={t`Add tab`}
      isTooltipDisabled={isTooltipDisabled}
      isActive={false}
      isExpanded={isExpanded}
      onClick={createTab}
    />
  );
};
