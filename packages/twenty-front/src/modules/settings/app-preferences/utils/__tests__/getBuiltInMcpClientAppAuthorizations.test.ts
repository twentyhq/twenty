import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { getBuiltInMcpClientAppAuthorizations } from '@/settings/app-preferences/utils/getBuiltInMcpClientAppAuthorizations';

const [CHATGPT_APP, CLAUDE_APP] = BUILT_IN_MCP_CLIENT_APPS;

const AUTHORIZATIONS = [
  { id: 'claude-ai', redirectUriHostnames: ['claude.ai'] },
  { id: 'claude-com', redirectUriHostnames: ['claude.com'] },
  { id: 'chatgpt', redirectUriHostnames: ['chatgpt.com'] },
  { id: 'cursor', redirectUriHostnames: ['localhost'] },
  { id: 'no-redirect', redirectUriHostnames: [] },
  {
    id: 'claims-claude',
    redirectUriHostnames: ['claude.ai', 'third-party.example'],
  },
];

describe('getBuiltInMcpClientAppAuthorizations', () => {
  it('keeps the authorizations whose callback hosts all belong to Claude', () => {
    expect(
      getBuiltInMcpClientAppAuthorizations({
        authorizations: AUTHORIZATIONS,
        builtInMcpClientApp: CLAUDE_APP,
      }).map(({ id }) => id),
    ).toEqual(['claude-ai', 'claude-com']);
  });

  it('keeps the authorizations whose callback hosts all belong to ChatGPT', () => {
    expect(
      getBuiltInMcpClientAppAuthorizations({
        authorizations: AUTHORIZATIONS,
        builtInMcpClientApp: CHATGPT_APP,
      }).map(({ id }) => id),
    ).toEqual(['chatgpt']);
  });
});
