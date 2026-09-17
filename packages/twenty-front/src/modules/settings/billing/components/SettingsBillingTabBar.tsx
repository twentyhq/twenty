import { billingState } from '@/client-config/states/billingState';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { matchPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { TabListButton } from '@/ui/layout/tab-list/components/TabListButton';
import { IconColorSwatch, IconCreditCard, IconGauge } from 'twenty-ui/icon';

const StyledTabBar = styled.div`
  display: flex;
  flex: 1;
  gap: ${TAB_LIST_GAP}px;
  justify-content: center;
  min-width: 0;
`;

export const SettingsBillingTabBar = () => {
  const { t } = useLingui();
  const location = useLocation();
  const billing = useAtomStateValue(billingState);

  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  if (!isBillingEnabled) {
    return null;
  }

  const billingPath = getSettingsPath(SettingsPath.Billing);
  const plansPath = getSettingsPath(SettingsPath.BillingPlans);
  const limitsPath = getSettingsPath(SettingsPath.BillingLimits);

  const isTabActive = (path: string) =>
    matchPath({ path, end: true }, location.pathname) !== null;

  return (
    <StyledTabBar>
      <TabListButton
        id="billing"
        title={t`Billing`}
        LeftIcon={IconCreditCard}
        active={isTabActive(billingPath)}
        to={billingPath}
      />
      <TabListButton
        id="plans"
        title={t`Plans`}
        LeftIcon={IconColorSwatch}
        active={isTabActive(plansPath)}
        to={plansPath}
      />
      <TabListButton
        id="limits"
        title={t`Limits`}
        LeftIcon={IconGauge}
        active={isTabActive(limitsPath)}
        to={limitsPath}
      />
    </StyledTabBar>
  );
};
