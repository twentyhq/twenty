import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Any registered client can list a claude.ai callback next to its own, so every callback must belong to the app
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
  authorizations.filter(
    ({ redirectUriHostnames }) =>
      isNonEmptyArray(redirectUriHostnames) &&
      redirectUriHostnames.every((hostname) =>
        builtInMcpClientApp.redirectUriHostnames.includes(hostname),
      ),
  );
