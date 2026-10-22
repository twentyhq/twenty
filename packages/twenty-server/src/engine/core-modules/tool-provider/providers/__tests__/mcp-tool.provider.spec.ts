import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { McpToolProvider } from 'src/engine/core-modules/tool-provider/providers/mcp-tool.provider';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServerMaps } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server-maps.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const HELP_CENTER_APPLICATION_ID = 'help-center-application-id';
const CONTEXT = {
  workspaceId: WORKSPACE_ID,
  rolePermissionConfig: { intersectionOf: { userWorkspaceRoleId: 'role-id' } },
  userId: 'user-id',
};

const SEARCH_TOOL: McpServerTool = {
  name: 'search_docs',
  description: 'Search the docs',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  annotations: { readOnlyHint: true },
};

const DELETE_TOOL: McpServerTool = {
  name: 'delete_page',
  description: null,
  inputSchema: { type: 'object', properties: {} },
  annotations: { destructiveHint: true },
};

const createFlatMcpServer = (
  overrides: Partial<FlatMcpServer> & Pick<FlatMcpServer, 'name'>,
): FlatMcpServer =>
  ({
    id: `${overrides.name}-id`,
    universalIdentifier: overrides.name,
    label: overrides.name.toUpperCase(),
    url: `https://${overrides.name}.example.com/mcp`,
    authorizationHeaderValue: null,
    isEnabled: true,
    tools: [SEARCH_TOOL],
    workspaceId: WORKSPACE_ID,
    applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    ...overrides,
  }) as FlatMcpServer;

const buildProvider = ({
  mcpServers,
  isFeatureEnabled = true,
  callTool = jest.fn(),
}: {
  mcpServers: FlatMcpServer[];
  isFeatureEnabled?: boolean;
  callTool?: jest.Mock;
}) => {
  const flatMcpServerMaps = createEmptyFlatEntityMaps() as FlatMcpServerMaps;

  for (const mcpServer of mcpServers) {
    flatMcpServerMaps.byUniversalIdentifier[mcpServer.universalIdentifier] =
      mcpServer;
    flatMcpServerMaps.universalIdentifierById[mcpServer.id] =
      mcpServer.universalIdentifier;
  }

  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest
      .fn()
      .mockResolvedValue({ flatMcpServerMaps }),
  } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;

  const featureFlagService = {
    isFeatureEnabled: jest.fn().mockResolvedValue(isFeatureEnabled),
  } as unknown as FeatureFlagService;

  const mcpServerClientService = {
    callTool,
  } as unknown as McpServerClientService;

  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: WORKSPACE_CUSTOM_APPLICATION_ID,
        },
      }),
  } as unknown as ApplicationService;

  return new McpToolProvider(
    flatEntityMapsCacheService,
    featureFlagService,
    mcpServerClientService,
    applicationService,
  );
};

describe('McpToolProvider', () => {
  it('is only available behind the feature flag', async () => {
    expect(
      await buildProvider({
        mcpServers: [],
        isFeatureEnabled: false,
      }).isAvailable(CONTEXT),
    ).toBe(false);
    expect(await buildProvider({ mcpServers: [] }).isAvailable(CONTEXT)).toBe(
      true,
    );
  });

  it('emits one prefixed descriptor per cached tool of enabled servers', async () => {
    const provider = buildProvider({
      mcpServers: [
        createFlatMcpServer({
          name: 'docs',
          tools: [SEARCH_TOOL, DELETE_TOOL],
        }),
        createFlatMcpServer({ name: 'disabled', isEnabled: false }),
        createFlatMcpServer({ name: 'empty', tools: [] }),
      ],
    });

    const descriptors = (await provider.generateDescriptors(
      CONTEXT,
    )) as ToolDescriptor[];

    expect(descriptors.map(({ name }) => name)).toEqual([
      'mcp_docs_search_docs',
      'mcp_docs_delete_page',
    ]);
    expect(descriptors[0]).toMatchObject({
      label: 'DOCS: search_docs',
      description: 'Search the docs',
      category: 'MCP',
      executionRef: { kind: 'static', toolId: 'mcp_docs_search_docs' },
      inputSchema: SEARCH_TOOL.inputSchema,
    });
    expect(descriptors[0].approval).toBeUndefined();
    expect(descriptors[1].approval).toEqual({ template: 'generic' });
  });

  it('honours the requested tool names and schema option', async () => {
    const provider = buildProvider({
      mcpServers: [
        createFlatMcpServer({
          name: 'docs',
          tools: [SEARCH_TOOL, DELETE_TOOL],
        }),
      ],
    });

    const descriptors = await provider.generateDescriptors(CONTEXT, {
      includeSchemas: false,
      toolNames: new Set(['mcp_docs_delete_page']),
    });

    expect(descriptors).toHaveLength(1);
    expect(descriptors[0].name).toBe('mcp_docs_delete_page');
    expect('inputSchema' in descriptors[0]).toBe(false);
  });

  it('names app-declared server tools like other app tools and scopes them to their app', async () => {
    const helpCenterServer = createFlatMcpServer({
      name: 'help_center',
      applicationId: HELP_CENTER_APPLICATION_ID,
    });
    const provider = buildProvider({
      mcpServers: [createFlatMcpServer({ name: 'docs' }), helpCenterServer],
    });

    const sessionDescriptors = await provider.generateDescriptors(CONTEXT);

    expect(sessionDescriptors.map(({ name }) => name)).toEqual([
      'mcp_docs_search_docs',
      'app_help_center_search_docs',
    ]);

    const otherApplicationDescriptors = await provider.generateDescriptors({
      ...CONTEXT,
      application: {
        id: 'other-application-id',
        sourceType: ApplicationRegistrationSourceType.NPM,
      } as FlatApplication,
    });

    expect(otherApplicationDescriptors).toEqual([]);

    const output = await provider.executeStaticTool(
      'app_help_center_search_docs',
      {},
      {
        ...CONTEXT,
        application: {
          id: 'other-application-id',
          sourceType: ApplicationRegistrationSourceType.NPM,
        } as FlatApplication,
      },
    );

    expect(output.success).toBe(false);
  });

  it('calls the remote tool and converts its content', async () => {
    const callTool = jest.fn().mockResolvedValue({
      isError: false,
      content: [{ type: 'text', text: 'First result' }],
    });
    const docsServer = createFlatMcpServer({ name: 'docs' });
    const provider = buildProvider({ mcpServers: [docsServer], callTool });

    const output = await provider.executeStaticTool(
      'mcp_docs_search_docs',
      { query: 'views' },
      CONTEXT,
    );

    expect(callTool).toHaveBeenCalledWith({
      mcpServer: docsServer,
      toolName: 'search_docs',
      args: { query: 'views' },
      userId: 'user-id',
    });
    expect(output).toMatchObject({
      success: true,
      result: { text: 'First result' },
    });
  });

  it('reports remote errors and unknown tools as failed outputs', async () => {
    const callTool = jest.fn().mockResolvedValue({
      isError: true,
      content: [{ type: 'text', text: 'Rate limited' }],
    });
    const provider = buildProvider({
      mcpServers: [createFlatMcpServer({ name: 'docs' })],
      callTool,
    });

    expect(
      await provider.executeStaticTool('mcp_docs_search_docs', {}, CONTEXT),
    ).toMatchObject({ success: false, error: 'Rate limited' });

    expect(
      await provider.executeStaticTool('mcp_docs_unknown', {}, CONTEXT),
    ).toMatchObject({ success: false });
    expect(callTool).toHaveBeenCalledTimes(1);
  });
});
