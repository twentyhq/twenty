import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { McpToolProvider } from 'src/engine/core-modules/tool-provider/providers/mcp-tool.provider';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { type McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const createTool = (overrides: Partial<McpServerTool> = {}): McpServerTool => ({
  name: 'search_docs',
  description: 'Search the documentation',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  annotations: null,
  ...overrides,
});

const createFlatMcpServer = (
  overrides: Partial<FlatMcpServer> = {},
): FlatMcpServer =>
  ({
    id: 'docs-id',
    universalIdentifier: 'docs-universal-id',
    workspaceId: WORKSPACE_ID,
    applicationId: 'application-id',
    name: 'docs',
    label: 'Docs',
    url: 'https://docs.example.com/mcp',
    connectionProviderId: null,
    isActive: true,
    tools: [createTool()],
    toolsSyncedAt: new Date('2026-11-01T00:00:00Z'),
    toolsSyncError: null,
    updatedAt: new Date('2026-11-01T00:00:00Z'),
    ...overrides,
  }) as FlatMcpServer;

const setup = ({
  mcpServers,
  isFeatureEnabled = true,
}: {
  mcpServers: FlatMcpServer[];
  isFeatureEnabled?: boolean;
}) => {
  const flatMcpServerMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatMcpServer>;

  for (const mcpServer of mcpServers) {
    flatMcpServerMaps.byUniversalIdentifier[mcpServer.universalIdentifier] =
      mcpServer;
    flatMcpServerMaps.universalIdentifierById[mcpServer.id] =
      mcpServer.universalIdentifier;
  }

  const featureFlagService = {
    isFeatureEnabled: jest.fn().mockResolvedValue(isFeatureEnabled),
  } as unknown as FeatureFlagService;
  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest
      .fn()
      .mockResolvedValue({ flatMcpServerMaps }),
  } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;
  const mcpServerClientService = {
    callTool: jest.fn(),
    canCallerConnect: jest.fn().mockResolvedValue(true),
  };
  const mcpServerToolSyncService = { syncTools: jest.fn() };

  const provider = new McpToolProvider(
    featureFlagService,
    flatEntityMapsCacheService,
    mcpServerClientService as unknown as McpServerClientService,
    mcpServerToolSyncService as unknown as McpServerToolSyncService,
  );

  return { provider, mcpServerClientService, mcpServerToolSyncService };
};

const context = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
};

describe('McpToolProvider', () => {
  it('is only available behind the MCP servers feature flag', async () => {
    const { provider } = setup({ mcpServers: [], isFeatureEnabled: false });

    expect(await provider.isAvailable(context)).toBe(false);
  });

  it('exposes one descriptor per cached tool, named after the server', async () => {
    const { provider } = setup({ mcpServers: [createFlatMcpServer()] });

    const [descriptor] = (await provider.generateDescriptors(
      context,
    )) as ToolDescriptor[];

    expect(descriptor).toEqual({
      name: 'mcp_docs_search_docs',
      label: 'search_docs',
      description: 'Search the documentation (MCP server: Docs)',
      category: 'MCP',
      executionRef: { kind: 'static', toolId: 'mcp_docs_search_docs' },
      icon: 'IconPlugConnected',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' } },
      },
    });
  });

  it('skips inactive servers', async () => {
    const { provider } = setup({
      mcpServers: [createFlatMcpServer({ isActive: false })],
    });

    expect(await provider.generateDescriptors(context)).toEqual([]);
  });

  it('tells the model to propose destructive tools first', async () => {
    const { provider } = setup({
      mcpServers: [
        createFlatMcpServer({
          tools: [
            createTool({
              name: 'delete_page',
              annotations: { title: 'Delete page', destructiveHint: true },
            }),
          ],
        }),
      ],
    });

    const [descriptor] = await provider.generateDescriptors(context);

    expect(descriptor.label).toBe('Delete page');
    expect(descriptor.description).toContain('propose_tool_call');
  });

  it('syncs a server that was never synced once the caller can connect', async () => {
    const { provider, mcpServerToolSyncService, mcpServerClientService } =
      setup({
        mcpServers: [
          createFlatMcpServer({
            connectionProviderId: 'provider-id',
            tools: [],
            toolsSyncedAt: null,
            toolsSyncError: 'No connected account',
            updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          }),
        ],
      });

    await provider.generateDescriptors(context);

    expect(mcpServerClientService.canCallerConnect).toHaveBeenCalledWith(
      expect.objectContaining({ userWorkspaceId: USER_WORKSPACE_ID }),
    );
    expect(mcpServerToolSyncService.syncTools).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'docs-id',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    );
  });

  it('does not hammer a server whose sync just failed', async () => {
    const { provider, mcpServerToolSyncService } = setup({
      mcpServers: [
        createFlatMcpServer({
          tools: [],
          toolsSyncedAt: null,
          toolsSyncError: 'timeout',
          updatedAt: new Date().toISOString(),
        }),
      ],
    });

    await provider.generateDescriptors(context);

    expect(mcpServerToolSyncService.syncTools).not.toHaveBeenCalled();
  });

  it('calls the remote tool with the caller identity and maps its result', async () => {
    const { provider, mcpServerClientService } = setup({
      mcpServers: [createFlatMcpServer()],
    });

    mcpServerClientService.callTool.mockResolvedValue({
      content: [{ type: 'text', text: 'two results' }],
    });

    const output = await provider.executeStaticTool(
      'mcp_docs_search_docs',
      { query: 'invoices' },
      context,
    );

    expect(mcpServerClientService.callTool).toHaveBeenCalledWith({
      target: expect.objectContaining({
        url: 'https://docs.example.com/mcp',
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
      toolName: 'search_docs',
      toolArguments: { query: 'invoices' },
    });
    expect(output).toEqual({
      success: true,
      message: 'MCP tool mcp_docs_search_docs executed',
      result: { content: [{ type: 'text', text: 'two results' }] },
    });
  });

  it('refreshes the cached list when the server no longer knows the tool', async () => {
    const { provider, mcpServerClientService, mcpServerToolSyncService } =
      setup({ mcpServers: [createFlatMcpServer()] });

    mcpServerClientService.callTool.mockRejectedValue(
      new McpError(ErrorCode.InvalidParams, 'Tool search_docs not found'),
    );

    const output = await provider.executeStaticTool(
      'mcp_docs_search_docs',
      {},
      context,
    );

    expect(mcpServerToolSyncService.syncTools).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'docs-id' }),
    );
    expect(output.success).toBe(false);
  });

  it('fails cleanly for a tool no server offers', async () => {
    const { provider, mcpServerClientService } = setup({
      mcpServers: [createFlatMcpServer()],
    });

    const output = await provider.executeStaticTool(
      'mcp_docs_nope',
      {},
      context,
    );

    expect(output.success).toBe(false);
    expect(mcpServerClientService.callTool).not.toHaveBeenCalled();
  });
});
