import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { doRedirectUriHostnamesBelongToBuiltInMcpClientApp } from '@/settings/app-preferences/utils/doRedirectUriHostnamesBelongToBuiltInMcpClientApp';

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
    doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
      redirectUriHostnames,
      builtInMcpClientApp,
    }),
  );
