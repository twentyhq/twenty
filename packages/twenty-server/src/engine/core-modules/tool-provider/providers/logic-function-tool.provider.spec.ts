import { PermissionFlagType } from 'twenty-shared/constants';

import { EXA_WEB_SEARCH_TOOL_NAME } from 'src/engine/core-modules/tool-provider/constants/exa-web-search-tool-name.const';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const buildLogicFunction = (
  name: string,
  overrides: Partial<FlatLogicFunction> = {},
): FlatLogicFunction =>
  ({
    id: `${name}-id`,
    name,
    description: `${name} description`,
    deletedAt: null,
    toolTriggerSettings: { inputSchema: {} },
    ...overrides,
  }) as FlatLogicFunction;

describe('LogicFunctionToolProvider', () => {
  const workspaceId = 'workspace-id';

  const buildContext = (): ToolProviderContext =>
    ({
      workspaceId,
      roleId: 'role-id',
      rolePermissionConfig: { unionOf: ['role-id'] },
    }) as ToolProviderContext;

  let flatEntityMapsCacheService: jest.Mocked<
    Pick<
      WorkspaceManyOrAllFlatEntityMapsCacheService,
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >
  >;
  let permissionsService: jest.Mocked<
    Pick<PermissionsService, 'hasToolPermission'>
  >;
  let provider: LogicFunctionToolProvider;

  beforeEach(() => {
    flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
    };

    permissionsService = {
      hasToolPermission: jest.fn(),
    };

    provider = new LogicFunctionToolProvider(
      flatEntityMapsCacheService as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
      permissionsService as unknown as PermissionsService,
    );
  });

  const mockLogicFunctions = (functions: FlatLogicFunction[]) => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatLogicFunctionMaps: {
          byUniversalIdentifier: Object.fromEntries(
            functions.map((fn) => [fn.id, fn]),
          ),
        },
      } as unknown as Awaited<
        ReturnType<
          WorkspaceManyOrAllFlatEntityMapsCacheService['getOrRecomputeManyOrAllFlatEntityMaps']
        >
      >,
    );
  };

  it('should exclude exa web search when WEB_SEARCH_TOOL is denied', async () => {
    mockLogicFunctions([buildLogicFunction('exa_web_search')]);
    permissionsService.hasToolPermission.mockResolvedValue(false);

    const descriptors = await provider.generateDescriptors(buildContext());

    expect(permissionsService.hasToolPermission).toHaveBeenCalledWith(
      expect.anything(),
      workspaceId,
      PermissionFlagType.WEB_SEARCH_TOOL,
    );
    expect(descriptors.find((d) => d.name === EXA_WEB_SEARCH_TOOL_NAME)).toBe(
      undefined,
    );
  });

  it('should include exa web search when WEB_SEARCH_TOOL is granted', async () => {
    mockLogicFunctions([buildLogicFunction('exa_web_search')]);
    permissionsService.hasToolPermission.mockResolvedValue(true);

    const descriptors = await provider.generateDescriptors(buildContext());

    expect(
      descriptors.find((d) => d.name === EXA_WEB_SEARCH_TOOL_NAME),
    ).toBeDefined();
  });

  it('should include non-exa logic functions without checking WEB_SEARCH_TOOL', async () => {
    mockLogicFunctions([buildLogicFunction('custom_helper')]);

    const descriptors = await provider.generateDescriptors(buildContext());

    expect(permissionsService.hasToolPermission).not.toHaveBeenCalled();
    expect(descriptors).toHaveLength(1);
    expect(descriptors[0].name).toBe('app_custom_helper');
  });
});
