import { v5 } from 'uuid';

import { AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stream-channel-id-namespace.const';
import { type AgentRunStreamOwner } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-stream-owner.type';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';

const applicationId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const runId = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';
const memberId = '20202020-0687-4c41-b707-ed1bfca972a7';
const otherMemberId = '20202020-77d5-4cb6-b60a-f4a835a85d61';

const applicationOwner = (
  workspaceMemberId: string | null = memberId,
): AgentRunStreamOwner => ({
  kind: 'application',
  applicationId,
  workspaceMemberId,
});

const workspaceMemberOwner = (
  workspaceMemberId: string = memberId,
): AgentRunStreamOwner => ({ kind: 'workspaceMember', workspaceMemberId });

const channelOf = ({
  owner = applicationOwner(),
  runId: overriddenRunId = runId,
}: {
  owner?: AgentRunStreamOwner;
  runId?: string;
} = {}) => buildAgentRunStreamChannelId({ owner, runId: overriddenRunId });

describe('buildAgentRunStreamChannelId', () => {
  it('should derive the same channel for the same run of the same caller', () => {
    expect(channelOf()).toBe(channelOf());
    expect(channelOf({ owner: workspaceMemberOwner() })).toBe(
      channelOf({ owner: workspaceMemberOwner() }),
    );
  });

  it('should keep the channels application callers already follow', () => {
    expect(channelOf()).toBe(
      v5(
        `${applicationId}:${memberId}:${runId}`,
        AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE,
      ),
    );
    expect(channelOf({ owner: applicationOwner(null) })).toBe(
      v5(
        `${applicationId}:application:${runId}`,
        AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE,
      ),
    );
  });

  it('should give another member naming the same run another channel', () => {
    expect(channelOf({ owner: applicationOwner(otherMemberId) })).not.toBe(
      channelOf(),
    );
    expect(channelOf({ owner: workspaceMemberOwner(otherMemberId) })).not.toBe(
      channelOf({ owner: workspaceMemberOwner() }),
    );
  });

  it('should give an application-only token its own channel, apart from every member', () => {
    expect(channelOf({ owner: applicationOwner(null) })).not.toBe(channelOf());
  });

  it('should keep a member session apart from any application acting as that member', () => {
    expect(channelOf({ owner: workspaceMemberOwner() })).not.toBe(channelOf());
  });

  it('should give another run or another application another channel', () => {
    expect(
      channelOf({ runId: '8d2e4f6a-1b3c-4d5e-9f70-a1b2c3d4e5f6' }),
    ).not.toBe(channelOf());
    expect(
      channelOf({
        owner: {
          kind: 'application',
          applicationId: '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0',
          workspaceMemberId: memberId,
        },
      }),
    ).not.toBe(channelOf());
  });

  it('should not reuse the run id itself as the channel', () => {
    expect(channelOf()).not.toBe(runId);
    expect(channelOf({ owner: workspaceMemberOwner() })).not.toBe(runId);
  });
});
