import { AppChip } from '@/applications/components/AppChip';
import { type CurrentUserApplicationAuthorizationsQuery } from '~/generated-metadata/graphql';

type SettingsConnectedAppLogoProps = {
  item: Pick<
    CurrentUserApplicationAuthorizationsQuery['currentUserApplicationAuthorizations'][number],
    'applicationId' | 'applicationName' | 'applicationLogoUrl'
  >;
};

export const SettingsConnectedAppLogo = ({
  item: applicationAuthorization,
}: SettingsConnectedAppLogoProps) => (
  <AppChip
    chipOnly
    applicationId={applicationAuthorization.applicationId}
    logoUrl={applicationAuthorization.applicationLogoUrl}
    fallbackApplicationData={{ name: applicationAuthorization.applicationName }}
  />
);
