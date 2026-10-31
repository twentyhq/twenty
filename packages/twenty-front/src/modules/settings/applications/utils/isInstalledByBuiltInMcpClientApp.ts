import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { doRedirectUriHostnamesBelongToBuiltInMcpClientApp } from '@/settings/app-preferences/utils/doRedirectUriHostnamesBelongToBuiltInMcpClientApp';
import {
  type ApplicationRegistrationSummary,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';

export const isInstalledByBuiltInMcpClientApp = ({
  application,
  builtInMcpClientApp,
}: {
  application: {
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'sourceType' | 'redirectUriHostnames'
    > | null;
  };
  builtInMcpClientApp: Pick<BuiltInMcpClientApp, 'redirectUriHostnames'>;
}): boolean =>
  application.applicationRegistration?.sourceType ===
    ApplicationRegistrationSourceType.OAUTH_ONLY &&
  doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
    redirectUriHostnames:
      application.applicationRegistration.redirectUriHostnames,
    builtInMcpClientApp,
  });
