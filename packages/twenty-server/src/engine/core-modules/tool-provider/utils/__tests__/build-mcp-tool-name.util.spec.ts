import { buildMcpToolName } from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-name.util';

describe('buildMcpToolName', () => {
  it('prefixes the server name and keeps snake case', () => {
    expect(
      buildMcpToolName({ mcpServerName: 'github', toolName: 'list_issues' }),
    ).toBe('mcp_github_list_issues');
  });

  it('normalizes dashes and casing the model providers reject', () => {
    expect(
      buildMcpToolName({ mcpServerName: 'my_docs', toolName: 'Search-Docs' }),
    ).toBe('mcp_my_docs_search_docs');
  });
});
