import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsBillingContent } from '@/billing/components/SettingsBillingContent';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { isPlansLoaded } = useBillingPlan();

  return (
    <SubMenuTopBarContainer
      title={t`Billing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Billing</Trans> },
      ]}
    >
      {currentWorkspace && isPlansLoaded ? <SettingsBillingContent /> : <></>}
    </SubMenuTopBarContainer>
  );
};
