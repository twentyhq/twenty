import { useLingui } from '@lingui/react/macro';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
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
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { createTab } = useCreateNavigationMenuTabOrSection();

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

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
