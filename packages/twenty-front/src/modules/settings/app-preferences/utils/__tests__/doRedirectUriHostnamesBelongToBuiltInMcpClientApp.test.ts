import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { doRedirectUriHostnamesBelongToBuiltInMcpClientApp } from '@/settings/app-preferences/utils/doRedirectUriHostnamesBelongToBuiltInMcpClientApp';

const [, CLAUDE_APP] = BUILT_IN_MCP_CLIENT_APPS;

describe('doRedirectUriHostnamesBelongToBuiltInMcpClientApp', () => {
  it('accepts callback hosts that all belong to the app', () => {
    expect(
      doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
        redirectUriHostnames: ['claude.ai', 'claude.com'],
        builtInMcpClientApp: CLAUDE_APP,
      }),
    ).toBe(true);
  });

  it('rejects callback hosts that include another client', () => {
    expect(
      doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
        redirectUriHostnames: ['claude.ai', 'third-party.example'],
        builtInMcpClientApp: CLAUDE_APP,
      }),
    ).toBe(false);
  });

  it('rejects a registration without callback hosts', () => {
    expect(
      doRedirectUriHostnamesBelongToBuiltInMcpClientApp({
        redirectUriHostnames: [],
        builtInMcpClientApp: CLAUDE_APP,
      }),
    ).toBe(false);
  });
});
