import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

const WORKSPACE_ID = 'workspace-id';
const CHANNEL_ID = 'channel-id';
const THREAD_ID = 'thread-id';
const JOINER_ID = 'joiner-user-workspace-id';
const MEMBER_ID = 'existing-member-user-workspace-id';

const CHANNEL = {
  id: CHANNEL_ID,
  workspaceId: WORKSPACE_ID,
  visibility: AgentChatChannelVisibility.PRIVATE,
} as never;

// Read access through a role is read access already: joining as a member does
// not hand the joiner anything they did not have.
const buildService = ({ isRoleHolder = false } = {}) => {
  const broadcastChannel = jest.fn().mockResolvedValue(undefined);
  const broadcastMember = jest.fn().mockResolvedValue(undefined);
  const broadcastThreadAccessChange = jest.fn().mockResolvedValue(undefined);

  const service = Object.create(
    AgentChatChannelService.prototype,
  ) as AgentChatChannelService;

  Object.assign(service, {
    broadcastChannel,
    broadcastMember,
    isChannelRoleHolder: jest.fn().mockResolvedValue(isRoleHolder),
    getChannelRecipients: () => [MEMBER_ID, JOINER_ID],
    getReaderUserWorkspaceIds: jest
      .fn()
      .mockResolvedValue([MEMBER_ID, JOINER_ID]),
    getChannelThreadsWithRecipients: jest.fn().mockResolvedValue([
      {
        thread: { id: THREAD_ID },
        recipients: [MEMBER_ID, JOINER_ID],
        participantUserWorkspaceIds: [MEMBER_ID],
      },
    ]),
    memberRepository: {
      findOne: jest.fn().mockResolvedValue(null),
      insertAndReturnOne: jest.fn().mockResolvedValue({ id: 'member-id' }),
    },
    agentChatService: { broadcastThreadAccessChange },
  });

  return {
    service,
    broadcastChannel,
    broadcastThreadAccessChange,
  };
};

const insertMember = (service: AgentChatChannelService) =>
  (
    service as unknown as {
      insertMember: (input: {
        channel: unknown;
        userWorkspaceId: string;
        role: string;
        workspaceId: string;
      }) => Promise<unknown>;
    }
  ).insertMember({
    channel: CHANNEL,
    userWorkspaceId: JOINER_ID,
    role: 'member',
    workspaceId: WORKSPACE_ID,
  });

describe('AgentChatChannelService.insertMember', () => {
  it('hands the channel and its threads to somebody who could not read them', async () => {
    const { service, broadcastChannel, broadcastThreadAccessChange } =
      buildService();

    await insertMember(service);

    expect(broadcastChannel).toHaveBeenCalledWith('created', CHANNEL, [
      JOINER_ID,
    ]);
    expect(broadcastThreadAccessChange).toHaveBeenCalledWith(
      expect.objectContaining({ recipientsBefore: [MEMBER_ID] }),
    );
  });

  it('tells a role holder nothing was created, since they already read it', async () => {
    const { service, broadcastChannel, broadcastThreadAccessChange } =
      buildService({ isRoleHolder: true });

    await insertMember(service);

    expect(broadcastChannel).not.toHaveBeenCalledWith(
      'created',
      CHANNEL,
      expect.anything(),
    );
    expect(broadcastThreadAccessChange).toHaveBeenCalledWith(
      expect.objectContaining({ recipientsBefore: [MEMBER_ID, JOINER_ID] }),
    );
  });
});
