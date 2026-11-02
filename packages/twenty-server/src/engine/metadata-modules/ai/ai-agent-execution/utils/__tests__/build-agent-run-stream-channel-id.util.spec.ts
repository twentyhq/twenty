import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';

const applicationId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const runId = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';
const memberId = '20202020-0687-4c41-b707-ed1bfca972a7';
const otherMemberId = '20202020-77d5-4cb6-b60a-f4a835a85d61';

const channelOf = ({
  callerWorkspaceMemberId = memberId,
  ...overrides
}: Partial<Parameters<typeof buildAgentRunStreamChannelId>[0]> = {}) =>
  buildAgentRunStreamChannelId({
    applicationId,
    callerWorkspaceMemberId,
    runId,
    ...overrides,
  });

describe('buildAgentRunStreamChannelId', () => {
  it('should derive the same channel for the same run of the same caller', () => {
    expect(channelOf()).toBe(channelOf());
  });

  it('should give another member naming the same run another channel', () => {
    expect(channelOf({ callerWorkspaceMemberId: otherMemberId })).not.toBe(
      channelOf(),
    );
  });

  it('should give an application-only token its own channel, apart from every member', () => {
    expect(channelOf({ callerWorkspaceMemberId: null })).toBe(
      channelOf({ callerWorkspaceMemberId: null }),
    );
    expect(channelOf({ callerWorkspaceMemberId: null })).not.toBe(channelOf());
  });

  it('should give another run or another application another channel', () => {
    expect(
      channelOf({ runId: '8d2e4f6a-1b3c-4d5e-9f70-a1b2c3d4e5f6' }),
    ).not.toBe(channelOf());
    expect(
      channelOf({ applicationId: '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0' }),
    ).not.toBe(channelOf());
  });

  it('should not reuse the run id itself as the channel', () => {
    expect(channelOf()).not.toBe(runId);
  });
});
