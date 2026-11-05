import { fromMcpToolTargetToToolIndexEntry } from 'src/engine/core-modules/tool-provider/utils/from-mcp-tool-target-to-tool-index-entry.util';
import { type McpToolTarget } from 'src/engine/core-modules/tool-provider/types/mcp-tool-target.type';

const MCP_TOOL_TARGET: McpToolTarget = {
  name: 'mcp_docs_search_docs',
  mcpServer: {
    id: 'docs-id',
    workspaceId: 'workspace-id',
    name: 'docs',
    label: 'Docs',
    url: 'https://docs.example.com/mcp',
    connectionProviderId: null,
  },
  tool: {
    name: 'search_docs',
    description: 'Search the documentation',
    inputSchema: { type: 'object' },
    annotations: null,
  },
};

describe('fromMcpToolTargetToToolIndexEntry', () => {
  it('describes the tool and the server it comes from', () => {
    expect(fromMcpToolTargetToToolIndexEntry(MCP_TOOL_TARGET)).toEqual({
      name: 'mcp_docs_search_docs',
      label: 'search_docs',
      description: 'Search the documentation (MCP server: Docs)',
      category: 'MCP',
      executionRef: { kind: 'static', toolId: 'mcp_docs_search_docs' },
      icon: 'IconSparkles',
    });
  });

  it('falls back to the tool name without a description', () => {
    expect(
      fromMcpToolTargetToToolIndexEntry({
        ...MCP_TOOL_TARGET,
        tool: { ...MCP_TOOL_TARGET.tool, description: null },
      }).description,
    ).toBe('search_docs (MCP server: Docs)');
  });

  it('labels the tool with its title and flags it when destructive', () => {
    const indexEntry = fromMcpToolTargetToToolIndexEntry({
      ...MCP_TOOL_TARGET,
      tool: {
        ...MCP_TOOL_TARGET.tool,
        annotations: { title: 'Delete page', destructiveHint: true },
      },
    });

    expect(indexEntry.label).toBe('Delete page');
    expect(indexEntry.description).toContain('propose_tool_call');
  });
});
