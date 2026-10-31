import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { isInstalledByBuiltInMcpClientApp } from '@/settings/applications/utils/isInstalledByBuiltInMcpClientApp';
import { type ApplicationRegistrationSummary } from '~/generated-metadata/graphql';

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
    (application) =>
      !builtInMcpClientApps.some((builtInMcpClientApp) =>
        isInstalledByBuiltInMcpClientApp({ application, builtInMcpClientApp }),
      ),
  );
