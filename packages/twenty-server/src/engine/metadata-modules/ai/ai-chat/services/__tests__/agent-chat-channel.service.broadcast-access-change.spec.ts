import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';

const WORKSPACE_ID = 'workspace-id';
const CHANNEL = { id: 'channel-id', workspaceId: WORKSPACE_ID } as never;

// broadcastChannelAccessChange is private, which is the point: it is reached
// through the visibility change rather than called directly in the app.
const callBroadcastAccessChange = (
  service: AgentChatChannelService,
  args: {
    recipientsBefore: string[] | undefined;
    recipientsAfter: string[] | undefined;
    updatedFields: string[];
  },
) =>
  (
    service as unknown as {
      broadcastChannelAccessChange: (input: {
        channel: unknown;
        recipientsBefore: string[] | undefined;
        recipientsAfter: string[] | undefined;
        updatedFields: string[];
      }) => Promise<void>;
    }
  ).broadcastChannelAccessChange({ channel: CHANNEL, ...args });

const buildService = ({
  workspaceUserWorkspaceIds = ['uw-a', 'uw-b', 'uw-c'],
} = {}) => {
  const service = Object.create(
    AgentChatChannelService.prototype,
  ) as AgentChatChannelService;

  const broadcastChannel = jest.fn().mockResolvedValue(undefined);

  Object.assign(service, {
    broadcastChannel,
    agentChatService: {
      getWorkspaceUserWorkspaceIds: jest
        .fn()
        .mockResolvedValue(workspaceUserWorkspaceIds),
    },
  });

  return { service, broadcastChannel };
};

describe('AgentChatChannelService.broadcastChannelAccessChange', () => {
  it('takes a channel off the workspace and tells the rest what changed', async () => {
    const { service, broadcastChannel } = buildService();

    await callBroadcastAccessChange(service, {
      recipientsBefore: undefined,
      recipientsAfter: ['uw-a'],
      updatedFields: ['visibility'],
    });

    expect(broadcastChannel).toHaveBeenCalledWith('deleted', CHANNEL, [
      'uw-b',
      'uw-c',
    ]);
    // Everybody could read it a moment ago, so nobody is gaining it.
    expect(broadcastChannel).not.toHaveBeenCalledWith(
      'created',
      CHANNEL,
      expect.anything(),
    );
    expect(broadcastChannel).toHaveBeenCalledWith(
      'updated',
      CHANNEL,
      ['uw-a'],
      ['visibility'],
    );
  });

  it('says nothing to the readers it keeps when no field of the channel changed', async () => {
    const { service, broadcastChannel } = buildService();

    await callBroadcastAccessChange(service, {
      recipientsBefore: undefined,
      recipientsAfter: ['uw-a'],
      updatedFields: [],
    });

    expect(broadcastChannel).not.toHaveBeenCalledWith(
      'updated',
      CHANNEL,
      expect.anything(),
      expect.anything(),
    );
  });

  it('tells the whole workspace when a channel becomes public', async () => {
    const { service, broadcastChannel } = buildService();

    await callBroadcastAccessChange(service, {
      recipientsBefore: ['uw-a'],
      recipientsAfter: undefined,
      updatedFields: ['visibility'],
    });

    expect(broadcastChannel).toHaveBeenCalledWith(
      'updated',
      CHANNEL,
      undefined,
      ['visibility'],
    );
  });
});
