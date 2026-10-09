import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';

const applicationId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const agentId = '20202020-9e3b-46d4-a556-88b9ddc2b034';
const threadKey = 'C123:1700000000.000100';

describe('buildAgentRunThreadId', () => {
  it('should derive the same thread id for the same key', () => {
    expect(buildAgentRunThreadId({ applicationId, agentId, threadKey })).toBe(
      buildAgentRunThreadId({ applicationId, agentId, threadKey }),
    );
  });

  it('should give each application, agent and key its own thread id', () => {
    const threadId = buildAgentRunThreadId({
      applicationId,
      agentId,
      threadKey,
    });

    expect(
      buildAgentRunThreadId({
        applicationId: '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0',
        agentId,
        threadKey,
      }),
    ).not.toBe(threadId);
    expect(
      buildAgentRunThreadId({
        applicationId,
        agentId: '20202020-7a6f-4b2e-9c33-2f1e6b7c8d90',
        threadKey,
      }),
    ).not.toBe(threadId);
    expect(
      buildAgentRunThreadId({ applicationId, agentId, threadKey: 'C123:2' }),
    ).not.toBe(threadId);
  });
});
