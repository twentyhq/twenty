import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsBillingContent } from '@/billing/components/SettingsBillingContent';
import { useListPlansQuery } from '~/generated-metadata/graphql';
import Skeleton from 'react-loading-skeleton';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data: plans } = useListPlansQuery();

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
      {!currentWorkspace || !plans ? <Skeleton /> : <SettingsBillingContent />}
    </SubMenuTopBarContainer>
  );
};
