import { AppChip } from '@/applications/components/AppChip';
import { SettingsAppPreferencesApplicationRow } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationRow';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';

type SettingsAppPreferencesInstalledApplicationRowProps = {
  application: AppPreferencesApplication;
  hasConnectedAccount: boolean;
};

export const SettingsAppPreferencesInstalledApplicationRow = ({
  application,
  hasConnectedAccount,
}: SettingsAppPreferencesInstalledApplicationRowProps) => {
  const { t } = useLingui();
  const { connectionProviders, loading: connectionProvidersLoading } =
    useFindApplicationConnectionProviders(application.id);

  // An app declaring an OAuth provider acts on the member's behalf, so it
  // needs one of their accounts before its preferences mean anything.
  const isMissingAccount =
    !hasConnectedAccount &&
    connectionProviders.some((provider) => provider.type === 'oauth');

  return (
    <SettingsAppPreferencesApplicationRow
      name={application.name}
      icon={
        <AppChip
          applicationId={application.id}
          logoUrl={application.logoUrl}
          fallbackApplicationData={{ name: application.name }}
          size="md"
          chipOnly
        />
      }
      type={
        connectionProvidersLoading ? null : isMissingAccount ? (
          <Status color="red" weight="medium">{t`Missing account`}</Status>
        ) : (
          t`App`
        )
      }
      to={getSettingsPath(SettingsPath.AppPreferencesApplication, {
        applicationId: application.id,
      })}
    />
  );
};
