import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';

export const getBuiltInMcpClientAppAuthorizations = <
  TAuthorization extends Pick<
    BuiltInMcpClientAppAuthorization,
    'redirectUriHostnames'
  >,
>({
  authorizations,
  builtInMcpClientApp,
}: {
  authorizations: TAuthorization[];
  builtInMcpClientApp: Pick<BuiltInMcpClientApp, 'redirectUriHostnames'>;
}): TAuthorization[] =>
  authorizations.filter(({ redirectUriHostnames }) =>
    redirectUriHostnames.some((hostname) =>
      builtInMcpClientApp.redirectUriHostnames.includes(hostname),
    ),
  );
