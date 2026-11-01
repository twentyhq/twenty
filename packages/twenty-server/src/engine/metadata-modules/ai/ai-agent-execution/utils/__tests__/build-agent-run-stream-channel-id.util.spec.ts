import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';

const applicationId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const runId = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';

describe('buildAgentRunStreamChannelId', () => {
  it('should be the UUIDv5 of the application and the run', () => {
    expect(buildAgentRunStreamChannelId({ applicationId, runId })).toBe(
      'f504b066-c1a1-51af-89f9-ff3d94931ee0',
    );
  });

  it('should give another run of the same application another channel', () => {
    expect(
      buildAgentRunStreamChannelId({
        applicationId,
        runId: '8d2e4f6a-1b3c-4d5e-9f70-a1b2c3d4e5f6',
      }),
    ).not.toBe(buildAgentRunStreamChannelId({ applicationId, runId }));
  });

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
