import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';

const applicationId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const runId = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';

describe('buildAgentRunStreamChannelId', () => {
  it('should derive the same channel for the same run of the same application', () => {
    expect(buildAgentRunStreamChannelId({ applicationId, runId })).toBe(
      buildAgentRunStreamChannelId({ applicationId, runId }),
    );
  });

  it('should give another application naming the same run another channel', () => {
    expect(
      buildAgentRunStreamChannelId({
        applicationId: '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0',
        runId,
      }),
    ).not.toBe(buildAgentRunStreamChannelId({ applicationId, runId }));
  });

  it('should not reuse the run id itself as the channel', () => {
    expect(buildAgentRunStreamChannelId({ applicationId, runId })).not.toBe(
      runId,
    );
  });
});
