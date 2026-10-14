import { Test, type TestingModule } from '@nestjs/testing';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { type McpCoreQueryContext } from 'src/engine/api/mcp/types/mcp-core-query-context.type';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/utils/build-pending-activation-user-auth-context.util';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('McpProtocolService', () => {
  const workspace = { id: 'workspace-1' } as FlatWorkspace;
  let service: McpProtocolService;
  let userRoleService: { getRoleIdForUserWorkspace: jest.Mock };

  beforeEach(async () => {
    userRoleService = { getRoleIdForUserWorkspace: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        { provide: ToolRegistryService, useValue: {} },
        { provide: UserRoleService, useValue: userRoleService },
        { provide: McpToolExecutorService, useValue: {} },
        { provide: ApiKeyRoleService, useValue: {} },
        { provide: SkillService, useValue: {} },
        { provide: McpInstructionBuilderService, useValue: {} },
        { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
        { provide: WorkspaceCacheService, useValue: {} },
      ],
    }).compile();

    service = module.get(McpProtocolService);
  });

  it.each(['initialize', 'ping', 'tools/list', 'tools/call'])(
    'refuses %s from a user still onboarding',
    async (method) => {
      const queryContext: McpCoreQueryContext = {
        authContext: buildPendingActivationUserAuthContext({
          workspace,
          userWorkspaceId: 'user-workspace-1',
          user: { id: 'user-1' } as FlatAuthContextUser,
        }),
        workspace,
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
        apiKey: undefined,
        agentId: undefined,
        isDirectMode: false,
      };

      expect(
        await service.handleMCPCoreQuery(
          { jsonrpc: '2.0', id: 1, method },
          queryContext,
        ),
      ).toEqual({
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_ERROR_CODE.SERVER_ERROR,
          message: 'Finish signing up before using MCP',
        },
      });
      expect(userRoleService.getRoleIdForUserWorkspace).not.toHaveBeenCalled();
    },
  );

  it('answers ping from an API key', async () => {
    const apiKey = { id: 'api-key-1' } as FlatApiKey;

    expect(
      await service.handleMCPCoreQuery(
        { jsonrpc: '2.0', id: 1, method: 'ping' },
        {
          authContext: buildApiKeyAuthContext({ workspace, apiKey }),
          workspace,
          apiKey,
          agentId: undefined,
          isDirectMode: false,
        },
      ),
    ).toEqual({ id: 1, jsonrpc: '2.0', result: {} });
  });
});
