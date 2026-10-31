import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { doRedirectUriHostnamesBelongToBuiltInMcpClientApp } from '@/settings/app-preferences/utils/doRedirectUriHostnamesBelongToBuiltInMcpClientApp';
import {
  type ApplicationRegistrationSummary,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';

// Each ChatGPT or Claude connection installs its own OAuth app, which the built-in row already stands for
export const filterOutBuiltInMcpClientApplications = <
  TApplication extends {
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'sourceType' | 'redirectUriHostnames'
    > | null;
  },
>({
  applications,
  builtInMcpClientApps,
}: {
  applications: TApplication[];
  builtInMcpClientApps: Pick<BuiltInMcpClientApp, 'redirectUriHostnames'>[];
}): TApplication[] =>
  applications.filter(
    ({ applicationRegistration }) =>
      applicationRegistration?.sourceType !==
        ApplicationRegistrationSourceType.OAUTH_ONLY ||
      !builtInMcpClientApps.some((builtInMcpClientApp) =>
        doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
          redirectUriHostnames: applicationRegistration.redirectUriHostnames,
          builtInMcpClientApp,
        }),
      ),
  );
