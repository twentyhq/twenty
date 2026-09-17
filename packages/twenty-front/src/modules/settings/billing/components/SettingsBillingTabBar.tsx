import { billingState } from '@/client-config/states/billingState';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { matchPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { NavigationLink } from '@/ui/input/components/NavigationLink';
import { TabButton } from 'twenty-ui/components';
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
    isDefined(matchPath({ path, end: true }, location.pathname));

  const tabs = [
    {
      id: 'billing',
      title: t`Billing`,
      Icon: IconCreditCard,
      path: billingPath,
    },
    { id: 'plans', title: t`Plans`, Icon: IconColorSwatch, path: plansPath },
    { id: 'limits', title: t`Limits`, Icon: IconGauge, path: limitsPath },
  ];

  return (
    <StyledTabBar>
      {tabs.map(({ id, title, Icon, path }) => (
        <NavigationLink key={id} to={path}>
          {({ href, render }) => (
            <TabButton
              id={`tab-${id}`}
              data-testid={`tab-${id}`}
              startIcon={<Icon />}
              active={isTabActive(path)}
              aria-current={isTabActive(path) ? 'page' : undefined}
              href={href}
              render={render}
            >
              {title}
            </TabButton>
          )}
        </NavigationLink>
      ))}
    </StyledTabBar>
  );
};
