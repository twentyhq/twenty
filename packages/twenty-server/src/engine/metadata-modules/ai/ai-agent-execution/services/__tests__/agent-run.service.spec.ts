import { type AgentResponseFormat } from 'twenty-shared/ai';

import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const AGENT_ID = 'agent-id';
const AGENT_UNIVERSAL_IDENTIFIER = 'agent-universal-identifier';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const APPLICATION = {
  id: APPLICATION_ID,
  name: 'Research app',
  defaultRoleId: null,
};

const JSON_RESPONSE_FORMAT: AgentResponseFormat = {
  type: 'json',
  schema: {
    type: 'object',
    properties: { summary: { type: 'string' } },
  },
};

const buildService = (overrides: Record<string, unknown>) => {
  const agentRow = {
    id: AGENT_ID,
    universalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
    applicationId: APPLICATION_ID,
    name: 'researcher',
    label: 'Researcher',
    responseFormat: { type: 'text' },
    isActive: true,
    triggers: [],
    overrides: {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: overrides,
    },
  };
  const agentRepository = {
    findOne: jest.fn().mockResolvedValue(agentRow),
  };
  const applicationLookupService = {
    findById: jest.fn().mockResolvedValue(APPLICATION),
  };
  const agentActorContextService = {
    buildApplicationAgentContext: jest.fn().mockResolvedValue({
      application: APPLICATION,
      authContext: { type: 'application', application: APPLICATION },
      agentRoleId: undefined,
    }),
  };
  const agentRunnerService = { start: jest.fn().mockResolvedValue(undefined) };

  const service = new AgentRunService(
    agentActorContextService as never,
    agentRunnerService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    applicationLookupService as never,
    agentRepository as never,
  );

  return { service, agentRunnerService };
};

const runAgent = (service: AgentRunService) =>
  service.run({
    workspace: { id: WORKSPACE_ID } as never,
    requestUserWorkspaceId: null,
    requestWorkspaceMemberId: null,
    callerApplication: APPLICATION as never,
    input: {
      agentUniversalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
      prompt: 'Summarize the market',
      waitForCompletion: false,
    },
  });

describe('AgentRunService', () => {
  describe('run', () => {
    it('runs with the overridden label and response format', async () => {
      const { service, agentRunnerService } = buildService({
        label: 'Market researcher',
        responseFormat: JSON_RESPONSE_FORMAT,
      });

      await runAgent(service);

      expect(agentRunnerService.start).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.objectContaining({
            agentId: AGENT_ID,
            title: 'Market researcher',
          }),
        }),
      );
    });

    it('rejects an overridden response format without output fields', async () => {
      const { service, agentRunnerService } = buildService({
        responseFormat: { type: 'json', schema: { type: 'object' } },
      });

      await expect(runAgent(service)).rejects.toMatchObject(
        new AiException(
          'This agent has no output fields. Add at least one output field to its response format.',
          AiExceptionCode.INVALID_AGENT_INPUT,
        ),
      );
      expect(agentRunnerService.start).not.toHaveBeenCalled();
    });

    it('refuses an agent archived through its overrides', async () => {
      const { service } = buildService({ isActive: false });

      await expect(runAgent(service)).rejects.toMatchObject({
        code: AiExceptionCode.AGENT_IS_INACTIVE,
      });
    });
  });
});
