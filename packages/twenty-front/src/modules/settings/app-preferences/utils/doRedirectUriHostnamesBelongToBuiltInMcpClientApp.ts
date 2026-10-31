import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Any registered client can list a claude.ai callback next to its own, so every callback must belong to the app
export const doRedirectUriHostnamesBelongToBuiltInMcpClientApp = ({
  redirectUriHostnames,
  builtInMcpClientApp,
}: {
  redirectUriHostnames: string[];
  builtInMcpClientApp: Pick<BuiltInMcpClientApp, 'redirectUriHostnames'>;
}): boolean =>
  isNonEmptyArray(redirectUriHostnames) &&
  redirectUriHostnames.every((hostname) =>
    builtInMcpClientApp.redirectUriHostnames.includes(hostname),
  );
