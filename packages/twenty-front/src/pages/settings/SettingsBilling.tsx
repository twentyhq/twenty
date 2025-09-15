import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsBillingContent } from '@/billing/components/SettingsBillingContent';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';

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
