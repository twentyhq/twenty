import { DiscoveryService } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AGENT_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-write-access-policy.constant';

const WORKSPACE_ID = 'f3a1c7e2-5b9d-4e08-a6c4-2d7b9e1f3a50';
const OWN_AGENT_ID = '3f1c2a64-8d0e-4b7a-9c35-6e2f1a0b4d71';
const OTHER_AGENT_ID = '9b4e7d21-2c6f-4a85-b013-5d8e3f7a2c94';
const UNKNOWN_AGENT_ID = 'c7a2e5f8-4b19-4d3e-8f60-1a9b2c3d4e05';
const OTHER_APPLICATION_ID = '5e8d1c3b-7a2f-4e96-a4b0-8c1d2e3f4a56';

const INSTALLED_APPLICATION = {
  id: '2a7d4c1e-9f3b-4e68-8d25-4b1a6c9e7f30',
  sourceType: ApplicationRegistrationSourceType.NPM,
} as FlatApplication;

const OAUTH_ONLY_APPLICATION = {
  id: '6b9f2e4a-8c1d-4f73-b6e5-2a7c9d1e3f82',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
} as FlatApplication;

const archiveAgentInputSchema = z.object({ id: z.uuid() });

const executeArchiveAgent = jest.fn();

@DefineTool({
  name: 'archive_agent',
  category: ToolCategory.AGENT,
  description: 'Archive an agent.',
  accessPolicy: AGENT_WRITE_ACCESS_POLICY,
  applicationTarget: {
    kind: 'applicationOwnedEntity',
    metadataName: 'agent',
    idKey: 'id',
  },
})
class ArchiveAgentTool extends BaseTool<typeof archiveAgentInputSchema> {
  readonly inputSchema = archiveAgentInputSchema;

  async execute(
    args: ToolExecuteArgs<typeof archiveAgentInputSchema>,
  ): Promise<ToolOutput> {
    return executeArchiveAgent(args);
  }
}

const buildFlatAgentMaps = () => ({
  byUniversalIdentifier: {
    'own-agent': {
      id: OWN_AGENT_ID,
      universalIdentifier: 'own-agent',
      applicationId: INSTALLED_APPLICATION.id,
    },
    'other-agent': {
      id: OTHER_AGENT_ID,
      universalIdentifier: 'other-agent',
      applicationId: OTHER_APPLICATION_ID,
    },
  },
  universalIdentifierById: {
    [OWN_AGENT_ID]: 'own-agent',
    [OTHER_AGENT_ID]: 'other-agent',
  },
  universalIdentifiersByApplicationId: {},
});

const buildContext = (
  application: FlatApplication | undefined,
): ToolProviderContext => ({
  workspaceId: WORKSPACE_ID,
  authContext: {
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    application,
  } as WorkspaceAuthContext,
});

describe('DefinedToolRegistryService', () => {
  let registry: DefinedToolRegistryService;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;

  const archiveAgent = ({
    agentId,
    context,
  }: {
    agentId: string;
    context: ToolProviderContext;
  }) => {
    const definedTool = registry.findDefinedTool('archive_agent');

    if (definedTool === undefined) {
      throw new Error('archive_agent is not registered');
    }

    return registry.execute({
      definedTool,
      args: { id: agentId },
      context,
    });
  };

  beforeEach(async () => {
    executeArchiveAgent.mockReset();
    executeArchiveAgent.mockResolvedValue({
      success: true,
      message: 'Archived',
    });

    getOrRecomputeManyOrAllFlatEntityMaps = jest
      .fn()
      .mockResolvedValue({ flatAgentMaps: buildFlatAgentMaps() });

    const module = await Test.createTestingModule({
      providers: [
        DefinedToolRegistryService,
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: () => [
              { instance: new ArchiveAgentTool(), metatype: ArchiveAgentTool },
            ],
          },
        },
        {
          provide: AccessPolicyService,
          useValue: {
            isToolAccessPolicySatisfied: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            getWorkspaceFeatureFlagsMap: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
      ],
    }).compile();

    registry = module.get(DefinedToolRegistryService);
    registry.onModuleInit();
  });

  describe('application target', () => {
    it('should run the tool for a caller without an application without reading the target', async () => {
      const output = await archiveAgent({
        agentId: OTHER_AGENT_ID,
        context: buildContext(undefined),
      });

      expect(output).toEqual({ success: true, message: 'Archived' });
      expect(getOrRecomputeManyOrAllFlatEntityMaps).not.toHaveBeenCalled();
    });

    it('should run the tool for an OAuth-only client', async () => {
      const output = await archiveAgent({
        agentId: OTHER_AGENT_ID,
        context: buildContext(OAUTH_ONLY_APPLICATION),
      });

      expect(output).toEqual({ success: true, message: 'Archived' });
    });

    it('should run the tool on an entity the calling application owns', async () => {
      const output = await archiveAgent({
        agentId: OWN_AGENT_ID,
        context: buildContext(INSTALLED_APPLICATION),
      });

      expect(output).toEqual({ success: true, message: 'Archived' });
      expect(executeArchiveAgent).toHaveBeenCalledWith(
        expect.objectContaining({ input: { id: OWN_AGENT_ID } }),
      );
    });

    it('should refuse an entity another application owns without running the tool', async () => {
      const output = await archiveAgent({
        agentId: OTHER_AGENT_ID,
        context: buildContext(INSTALLED_APPLICATION),
      });

      expect(output).toMatchObject({
        success: false,
        message: 'Tool "archive_agent" cannot reach this agent',
      });
      expect(executeArchiveAgent).not.toHaveBeenCalled();
    });

    it('should leave unknown entity ids to the tool', async () => {
      const output = await archiveAgent({
        agentId: UNKNOWN_AGENT_ID,
        context: buildContext(INSTALLED_APPLICATION),
      });

      expect(output).toEqual({ success: true, message: 'Archived' });
    });

    it('should read the calling application from the auth context', async () => {
      const output = await archiveAgent({
        agentId: OTHER_AGENT_ID,
        context: {
          ...buildContext(INSTALLED_APPLICATION),
          application: undefined,
        },
      });

      expect(output).toMatchObject({ success: false });
      expect(executeArchiveAgent).not.toHaveBeenCalled();
    });
  });
});
