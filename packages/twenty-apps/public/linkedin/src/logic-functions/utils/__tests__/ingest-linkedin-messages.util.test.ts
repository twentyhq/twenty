import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const mocks = vi.hoisted(() => ({
  ingestMessages: vi.fn(),
  matchLinkedinParticipantPersonId: vi.fn(),
  createLinkedinPerson: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  ingestMessages: mocks.ingestMessages,
}));

vi.mock(
  'src/logic-functions/utils/match-linkedin-participant-person-id.util',
  () => ({
    matchLinkedinParticipantPersonId: mocks.matchLinkedinParticipantPersonId,
  }),
);

vi.mock('src/logic-functions/utils/create-linkedin-person.util', () => ({
  createLinkedinPerson: mocks.createLinkedinPerson,
}));

const { ingestLinkedinMessages } =
  await import('src/logic-functions/utils/ingest-linkedin-messages.util');

const PRIYA = {
  id: 'ACoPRIYA',
  display_name: 'Priya Nair',
  public_identifier: 'priya-nair',
};

const buildMessage = (isSender: boolean): UnipileMessage => ({
  id: `message-${isSender ? 'sent' : 'received'}`,
  chat_id: 'chat-1',
  sender_id: isSender ? 'ACoME' : PRIYA.id,
  text: 'Hello',
  timestamp: '2026-10-29T07:44:08.382Z',
  is_sender: isSender,
  is_deleted: false,
  is_event: false,
  provider: 'linkedin',
});

const ingest = ({
  settings = DEFAULT_LINKEDIN_SETTINGS,
  messages = [buildMessage(true)],
}: {
  settings?: typeof DEFAULT_LINKEDIN_SETTINGS;
  messages?: UnipileMessage[];
} = {}) =>
  ingestLinkedinMessages({
    channel: { id: 'channel-id', handle: 'https://www.linkedin.com/in/me' },
    settings,
    counterparts: [PRIYA],
    messages,
  });

const ingestedParticipantPersonIds = () =>
  mocks.ingestMessages.mock.calls[0][0].messages[0].participants.map(
    (participant: { personId?: string }) => participant.personId,
  );

describe('ingestLinkedinMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.matchLinkedinParticipantPersonId.mockResolvedValue(undefined);
    mocks.createLinkedinPerson.mockResolvedValue('created-id');
  });

  it('attaches the matched person to the participant', async () => {
    mocks.matchLinkedinParticipantPersonId.mockResolvedValue('priya-id');

    await expect(ingest()).resolves.toBe(1);
    expect(ingestedParticipantPersonIds()).toEqual([undefined, 'priya-id']);
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
  });

  it('creates a person for an unknown profile the member messaged', async () => {
    await ingest();

    expect(mocks.createLinkedinPerson).toHaveBeenCalledExactlyOnceWith({
      firstName: 'Priya',
      lastName: 'Nair',
      handle: 'https://www.linkedin.com/in/priya-nair',
    });
    expect(ingestedParticipantPersonIds()).toEqual([undefined, 'created-id']);
  });

  it('imports without creating anyone when the policy does not allow it', async () => {
    await ingest({ messages: [buildMessage(false)] });

    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
    expect(mocks.ingestMessages).toHaveBeenCalledTimes(1);
  });

  it('skips chats with nobody already in Twenty with Contacts only', async () => {
    await expect(
      ingest({
        settings: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          importPolicy: 'CONTACTS_ONLY',
        },
      }),
    ).resolves.toBe(0);
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });
});
