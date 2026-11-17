import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';

import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
  shouldShowTooltip: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
  shouldShowTooltip,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const { createTab } = useCreateNavigationMenuTabOrSection();

  return (
    <MainNavigationDrawerTab
      Icon={IconPlus}
      label={t`Add tab`}
      isActive={false}
      isExpanded={isExpanded}
      isDisabled={false}
      tooltip={t`Add tab`}
      shouldShowTooltip={shouldShowTooltip}
      onClick={createTab}
    />
  );
};
