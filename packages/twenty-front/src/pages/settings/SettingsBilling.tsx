import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsBillingContent } from '@/billing/components/SettingsBillingContent';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { usePlans } from '@/billing/hooks/usePlans';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { isPlansLoaded } = usePlans();

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
