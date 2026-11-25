import {
  buildMcpToolName,
  buildMcpToolTargets,
} from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-targets.util';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

const createTool = (name: string): McpServerTool => ({
  name,
  description: null,
  inputSchema: { type: 'object' },
  annotations: null,
});

const createMcpServer = ({
  name,
  toolNames,
}: {
  name: string;
  toolNames: string[];
}) => ({
  id: `${name}-id`,
  workspaceId: 'workspace-id',
  name,
  label: name,
  url: `https://${name}.example.com/mcp`,
  connectionProviderId: null,
  tools: toolNames.map(createTool),
});

describe('buildMcpToolTargets', () => {
  it('names each tool after its server, keeping the tool name as is', () => {
    const docs = createMcpServer({
      name: 'docs',
      toolNames: ['search_docs', 'Read-Page'],
    });

    expect(buildMcpToolTargets([docs])).toEqual([
      { name: 'mcp__docs__search_docs', mcpServer: docs, tool: docs.tools[0] },
      { name: 'mcp__docs__Read-Page', mcpServer: docs, tool: docs.tools[1] },
    ]);
  });

  it('tells apart tools of different servers that read the same', () => {
    const names = buildMcpToolTargets([
      createMcpServer({ name: 'docs', toolNames: ['admin_search'] }),
      createMcpServer({ name: 'docs_admin', toolNames: ['search'] }),
    ]).map(({ name }) => name);

    expect(names).toEqual([
      'mcp__docs__admin_search',
      'mcp__docs_admin__search',
    ]);
  });

  it('never renames a tool when another server or tool is added', () => {
    const docs = createMcpServer({ name: 'docs', toolNames: ['search'] });
    const [docsTarget] = buildMcpToolTargets([docs]);

    const [docsTargetAmongOthers] = buildMcpToolTargets([
      { ...docs, tools: [...docs.tools, createTool('Search')] },
      createMcpServer({ name: 'docs_search', toolNames: ['search'] }),
    ]);

    expect(docsTargetAmongOthers.name).toBe(docsTarget.name);
  });

  it('hashes the name when the server name cannot be told apart from the tool name', () => {
    const names = buildMcpToolTargets([
      createMcpServer({ name: 'docs__admin', toolNames: ['search'] }),
      createMcpServer({ name: 'docs', toolNames: ['admin__search'] }),
      createMcpServer({ name: 'docs_', toolNames: ['_search'] }),
    ]).map(({ name }) => name);

    expect(names[0]).toMatch(/^mcp__docs__admin__search_[a-f0-9]{8}$/);
    expect(names[1]).toBe('mcp__docs__admin__search');
    expect(names[2]).toMatch(/^mcp__docs____search_[a-f0-9]{8}$/);
  });

  it('keeps names within the model provider limit', () => {
    const name = buildMcpToolName({
      mcpServer: { id: 'server-id', name: 'a_server_with_a_rather_long_name' },
      toolName: 'a_tool_with_a_name_long_enough_to_overflow',
    });

    expect(name).toHaveLength(64);
    expect(name).toMatch(
      /^mcp__a_server_with_a_rather_long_name__a_tool_with_a_na_[a-f0-9]{8}$/,
    );
  });

  it('keeps a single target when a server lists the same tool twice', () => {
    expect(
      buildMcpToolTargets([
        createMcpServer({
          name: 'docs',
          toolNames: ['search_docs', 'search_docs'],
        }),
      ]),
    ).toHaveLength(1);
  });
});
