import { AiGenerateService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-generate.service';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = { id: 'workspace-id' };
const APPLICATION = { id: 'application-id' };
const RUN_ID = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';
const INPUT = [{ role: 'user', content: 'Qualify Acme' }];

const buildService = ({ existingTurn = null }: { existingTurn?: unknown }) => {
  const runInRequest = jest.fn().mockResolvedValue({
    runId: RUN_ID,
    outcome: { status: 'COMPLETED', result: { response: 'A fit' } },
    usage: { inputTokens: 1, outputTokens: 1 },
  });
  const findOne = jest.fn().mockResolvedValue(existingTurn);
  const service = new AiGenerateService(
    { buildExecutionContext: jest.fn().mockResolvedValue({}) } as never,
    { runInRequest } as never,
    { findOne } as never,
  );

  return { service, runInRequest, findOne };
};

const generate = (
  service: AiGenerateService,
  {
    input,
    callerApplication,
  }: { input: Record<string, unknown>; callerApplication: unknown },
) =>
  service.generate({
    workspace: WORKSPACE as never,
    requestUserWorkspaceId: null,
    requestWorkspaceMemberId: null,
    callerApplication: callerApplication as never,
    callerApiKey: { id: 'api-key-id' } as never,
    input,
  });

describe('AiGenerateService', () => {
  it('runs under the caller run id and streams to that run channel of the caller', async () => {
    const { service, runInRequest } = buildService({});

    await generate(service, {
      input: { input: INPUT, runId: RUN_ID },
      callerApplication: APPLICATION,
    });

    expect(runInRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.objectContaining({ turnId: RUN_ID }),
        streamChannelId: buildAgentRunStreamChannelId({
          applicationId: APPLICATION.id,
          runId: RUN_ID,
        }),
      }),
    );
  });

  it('streams nowhere without a run id', async () => {
    const { service, runInRequest, findOne } = buildService({});

    await generate(service, {
      input: { input: INPUT },
      callerApplication: APPLICATION,
    });

    expect(runInRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.objectContaining({ turnId: undefined }),
        streamChannelId: undefined,
      }),
    );
    expect(findOne).not.toHaveBeenCalled();
  });

  it('refuses a run id that is already used', async () => {
    const { service, runInRequest } = buildService({
      existingTurn: { id: RUN_ID },
    });

    await expect(
      generate(service, {
        input: { input: INPUT, runId: RUN_ID },
        callerApplication: APPLICATION,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(runInRequest).not.toHaveBeenCalled();
  });

  it('refuses a run id without an application token', async () => {
    const { service, runInRequest } = buildService({});

    await expect(
      generate(service, {
        input: { input: INPUT, runId: RUN_ID },
        callerApplication: undefined,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(runInRequest).not.toHaveBeenCalled();
  });

  it('refuses a run id that is not a uuid', async () => {
    const { service } = buildService({});

    await expect(
      generate(service, {
        input: { input: INPUT, runId: 'run-1' },
        callerApplication: APPLICATION,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });
});
