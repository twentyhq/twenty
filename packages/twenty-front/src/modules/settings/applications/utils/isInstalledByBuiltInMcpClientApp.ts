import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type ApplicationRegistrationSummary } from '~/generated-metadata/graphql';

export const isInstalledByBuiltInMcpClientApp = ({
  application,
  builtInMcpClientApp,
}: {
  application: {
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'wellKnownOAuthClient'
    > | null;
  };
  builtInMcpClientApp: Pick<BuiltInMcpClientApp, 'wellKnownOAuthClient'>;
}): boolean =>
  application.applicationRegistration?.wellKnownOAuthClient ===
  builtInMcpClientApp.wellKnownOAuthClient;
