import { buildMcpToolTargets } from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-targets.util';
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
  it('names each tool after its server', () => {
    const docs = createMcpServer({
      name: 'docs',
      toolNames: ['search_docs', 'Read-Page'],
    });

    expect(buildMcpToolTargets([docs])).toEqual([
      { name: 'mcp_docs_search_docs', mcpServer: docs, tool: docs.tools[0] },
      { name: 'mcp_docs_read_page', mcpServer: docs, tool: docs.tools[1] },
    ]);
  });

  it('tells apart tools of different servers that read the same', () => {
    const targets = buildMcpToolTargets([
      createMcpServer({ name: 'docs', toolNames: ['admin_search'] }),
      createMcpServer({ name: 'docs_admin', toolNames: ['search'] }),
    ]);

    const [docsTargetName, docsAdminTargetName] = targets.map(
      ({ name }) => name,
    );

    expect(docsTargetName).toMatch(/^mcp_docs_admin_search_[a-f0-9]{8}$/);
    expect(docsAdminTargetName).toMatch(/^mcp_docs_admin_search_[a-f0-9]{8}$/);
    expect(docsTargetName).not.toBe(docsAdminTargetName);
  });

  it('tells apart tools of one server that normalize to the same name', () => {
    const names = buildMcpToolTargets([
      createMcpServer({
        name: 'docs',
        toolNames: ['search-docs', 'search_docs'],
      }),
    ]).map(({ name }) => name);

    expect(new Set(names).size).toBe(2);
  });

  it('keeps names within the model provider limit', () => {
    const [{ name }] = buildMcpToolTargets([
      createMcpServer({
        name: 'a_server_with_a_rather_long_name',
        toolNames: ['a_tool_with_a_name_long_enough_to_overflow_the_limit'],
      }),
    ]);

    expect(name).toHaveLength(64);
    expect(name).toMatch(
      /^mcp_a_server_with_a_rather_long_name_a_tool_with_a_name_[a-f0-9]{8}$/,
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

  it('names a tool the same way whatever the server order', () => {
    const docs = createMcpServer({ name: 'docs', toolNames: ['admin_search'] });
    const docsAdmin = createMcpServer({
      name: 'docs_admin',
      toolNames: ['search'],
    });

    const [docsTarget] = buildMcpToolTargets([docs, docsAdmin]);
    const [, reorderedDocsTarget] = buildMcpToolTargets([docsAdmin, docs]);

    expect(reorderedDocsTarget.name).toBe(docsTarget.name);
  });
});
