import { getOutgoingMessageIds } from '@/activities/emails/utils/getOutgoingMessageIds';

const VIEWER_CHANNEL_ID = 'viewer-channel';
const TEAMMATE_CHANNEL_ID = 'teammate-channel';

const buildMessage = ({
  id,
  associations,
}: {
  id: string;
  associations: {
    messageChannelId: string;
    direction: 'INCOMING' | 'OUTGOING';
  }[];
}) => ({
  id,
  messageChannelMessageAssociations: associations.map((association, index) => ({
    id: `${id}-${index}`,
    ...association,
  })),
});

describe('getOutgoingMessageIds', () => {
  it('should mark messages sent from one of the viewer channels', () => {
    expect(
      getOutgoingMessageIds({
        messages: [
          buildMessage({
            id: 'sent',
            associations: [
              { messageChannelId: VIEWER_CHANNEL_ID, direction: 'OUTGOING' },
            ],
          }),
          buildMessage({
            id: 'received',
            associations: [
              { messageChannelId: VIEWER_CHANNEL_ID, direction: 'INCOMING' },
            ],
          }),
        ],
        viewerMessageChannelIds: new Set([VIEWER_CHANNEL_ID]),
      }),
    ).toEqual(new Set(['sent']));
  });

  it('should not mark a teammate message as the viewer outgoing one', () => {
    expect(
      getOutgoingMessageIds({
        messages: [
          buildMessage({
            id: 'teammate-sent',
            associations: [
              { messageChannelId: TEAMMATE_CHANNEL_ID, direction: 'OUTGOING' },
              { messageChannelId: VIEWER_CHANNEL_ID, direction: 'INCOMING' },
            ],
          }),
        ],
        viewerMessageChannelIds: new Set([VIEWER_CHANNEL_ID]),
      }),
    ).toEqual(new Set());
  });

  it('should treat messages without associations as incoming', () => {
    expect(
      getOutgoingMessageIds({
        messages: [{ id: 'orphan' }],
        viewerMessageChannelIds: new Set([VIEWER_CHANNEL_ID]),
      }),
    ).toEqual(new Set());
  });
});
