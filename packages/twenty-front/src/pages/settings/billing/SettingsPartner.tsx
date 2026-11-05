import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingPartnerCodeForm } from '@/settings/billing/components/SettingsBillingPartnerCodeForm';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsPartner = () => {
  const { t } = useLingui();
  const billing = useAtomStateValue(billingState);

  if (isDefined(billing) && !billing.isBillingEnabled) {
    return <Navigate to={getSettingsPath(SettingsPath.General)} replace />;
  }

  return (
    <SettingsPageLayout
      title={t`Partner`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Partner` },
      ]}
    >
      <SettingsPageContainer>
        {isDefined(billing) && <SettingsBillingPartnerCodeForm />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
