import { isDefined } from 'twenty-sdk/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const mocks = vi.hoisted(() => ({
  ingestMessages: vi.fn(),
  matchLinkedinParticipantPersonId: vi.fn(),
  createLinkedinPerson: vi.fn(),
  importLinkedinMessageAttachments: vi.fn(),
  resolveCounterpart: vi.fn(),
  hasPersonNamedLikeLinkedinUser: vi.fn(),
  setMissingLinkedinPersonAvatars: vi.fn(),
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

vi.mock(
  'src/logic-functions/utils/has-person-named-like-linkedin-user.util',
  () => ({
    hasPersonNamedLikeLinkedinUser: mocks.hasPersonNamedLikeLinkedinUser,
  }),
);

vi.mock(
  'src/logic-functions/utils/import-linkedin-message-attachments.util',
  () => ({
    importLinkedinMessageAttachments: mocks.importLinkedinMessageAttachments,
  }),
);

vi.mock(
  'src/logic-functions/utils/set-missing-linkedin-person-avatars.util',
  () => ({
    setMissingLinkedinPersonAvatars: mocks.setMissingLinkedinPersonAvatars,
  }),
);

const { ingestLinkedinMessages } =
  await import('src/logic-functions/utils/ingest-linkedin-messages.util');

const DEADLINE_AT_MS = Date.parse('2026-10-29T08:00:00.000Z');

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

const UNRESOLVED_PRIYA = { id: PRIYA.id, display_name: PRIYA.display_name };

const SAM = { id: 'ACoSAM', display_name: 'Sam Okafor' };

const resolveCounterpartsLikeUnipile = (): string[] => {
  const lookedUpUserIds: string[] = [];

  mocks.resolveCounterpart.mockImplementation(
    async ({
      user,
      shouldLookUp,
    }: {
      user: UnipileUser;
      shouldLookUp?: () => Promise<boolean>;
    }) => {
      if (isDefined(shouldLookUp) && !(await shouldLookUp())) {
        return user;
      }

      lookedUpUserIds.push(user.id);

      return { ...user, public_identifier: user.id.toLowerCase() };
    },
  );

  return lookedUpUserIds;
};

const ONE_TO_ONE_CHAT = {
  id: 'chat-1',
  name: 'Priya Nair',
  is_group: false,
  is_1to1: true,
  user: PRIYA,
};

const GROUP_CHAT = {
  id: 'chat-2',
  name: 'Q4 hiring',
  is_group: true,
  is_1to1: false,
  participants: [{ is_self: false, user: PRIYA }],
};

const ingest = ({
  settings = DEFAULT_LINKEDIN_SETTINGS,
  messages = [buildMessage(true)],
  chat = ONE_TO_ONE_CHAT,
  counterparts = [PRIYA],
}: {
  counterparts?: UnipileUser[];
  settings?: typeof DEFAULT_LINKEDIN_SETTINGS;
  messages?: UnipileMessage[];
  chat?: typeof ONE_TO_ONE_CHAT | typeof GROUP_CHAT;
} = {}) =>
  ingestLinkedinMessages({
    unipileAccountId: 'acc_1',
    attachmentDeadlineAtMs: DEADLINE_AT_MS,
    channel: { id: 'channel-id', handle: 'https://www.linkedin.com/in/me' },
    settings,
    chat,
    counterparts,
    resolveCounterpart: mocks.resolveCounterpart,
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
    mocks.importLinkedinMessageAttachments.mockResolvedValue(0);
    mocks.ingestMessages.mockImplementation(
      async ({ messages }: { messages: { externalId: string }[] }) =>
        messages.map(({ externalId }) => ({
          externalId,
          messageId: `id-${externalId}`,
          messageThreadId: 'thread-id',
          hasAttachments: false,
        })),
    );
    mocks.resolveCounterpart.mockImplementation(
      async ({ user }: { user: UnipileUser }) => user,
    );
    mocks.hasPersonNamedLikeLinkedinUser.mockResolvedValue(false);
  });

  it('looks up the counterpart of an All chats conversation without checking names', async () => {
    const lookedUpUserIds = resolveCounterpartsLikeUnipile();

    await ingest({ counterparts: [UNRESOLVED_PRIYA] });

    expect(lookedUpUserIds).toEqual([PRIYA.id]);
    expect(mocks.hasPersonNamedLikeLinkedinUser).not.toHaveBeenCalled();
  });

  it('looks up nobody in a Contacts only chat with someone no Person is named after', async () => {
    const lookedUpUserIds = resolveCounterpartsLikeUnipile();

    await expect(
      ingest({
        settings: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          importPolicy: 'CONTACTS_ONLY',
        },
        counterparts: [UNRESOLVED_PRIYA],
      }),
    ).resolves.toMatchObject({ skippedReason: 'NO_CONTACT' });
    expect(lookedUpUserIds).toEqual([]);
  });

  it('looks up only the group members a Person is named after', async () => {
    const lookedUpUserIds = resolveCounterpartsLikeUnipile();

    mocks.hasPersonNamedLikeLinkedinUser.mockImplementation(
      async (user: UnipileUser) => user.id === PRIYA.id,
    );
    mocks.matchLinkedinParticipantPersonId.mockImplementation(
      async ({ user }: { user: UnipileUser }) =>
        user.public_identifier === 'acopriya' ? 'priya-id' : undefined,
    );

    await expect(
      ingest({
        chat: GROUP_CHAT,
        counterparts: [UNRESOLVED_PRIYA, SAM],
        messages: [buildMessage(false)],
      }),
    ).resolves.toMatchObject({ ingestedMessageCount: 1 });
    expect(lookedUpUserIds).toEqual([PRIYA.id]);
  });

  it('looks up the other group members to create them once a contact is in the chat', async () => {
    const lookedUpUserIds = resolveCounterpartsLikeUnipile();

    mocks.hasPersonNamedLikeLinkedinUser.mockImplementation(
      async (user: UnipileUser) => user.id === PRIYA.id,
    );
    mocks.matchLinkedinParticipantPersonId.mockImplementation(
      async ({ user }: { user: UnipileUser }) =>
        user.public_identifier === 'acopriya' ? 'priya-id' : undefined,
    );

    await ingest({ chat: GROUP_CHAT, counterparts: [UNRESOLVED_PRIYA, SAM] });

    expect(lookedUpUserIds).toEqual([PRIYA.id, SAM.id]);
    expect(mocks.createLinkedinPerson).toHaveBeenCalledExactlyOnceWith({
      firstName: 'Sam',
      lastName: 'Okafor',
      handle: 'https://www.linkedin.com/in/acosam',
    });
  });

  it('links a group member found by their profile URL instead of creating them', async () => {
    resolveCounterpartsLikeUnipile();

    mocks.hasPersonNamedLikeLinkedinUser.mockImplementation(
      async (user: UnipileUser) => user.id === PRIYA.id,
    );
    mocks.matchLinkedinParticipantPersonId.mockImplementation(
      async ({ user }: { user: UnipileUser }) =>
        ({ acopriya: 'priya-id', acosam: 'sam-id' })[
          user.public_identifier ?? ''
        ],
    );

    await expect(
      ingest({ chat: GROUP_CHAT, counterparts: [UNRESOLVED_PRIYA, SAM] }),
    ).resolves.toMatchObject({ matchedPersonCount: 2, createdPersonCount: 0 });
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
    expect(ingestedParticipantPersonIds()).toContain('sam-id');
  });

  it('ingests under the public profile URL of the resolved counterpart', async () => {
    mocks.resolveCounterpart.mockResolvedValue(PRIYA);

    await ingest({
      counterparts: [{ ...PRIYA, public_identifier: undefined }],
    });

    expect(
      mocks.ingestMessages.mock.calls[0][0].messages[0].participants[1].handle,
    ).toBe('https://www.linkedin.com/in/priya-nair');
  });

  it('looks up no profile for a page with no message to import', async () => {
    await ingest({ messages: [{ ...buildMessage(false), is_event: true }] });

    expect(mocks.resolveCounterpart).not.toHaveBeenCalled();
  });

  it('attaches the matched person to the participant', async () => {
    mocks.matchLinkedinParticipantPersonId.mockResolvedValue('priya-id');

    await expect(ingest()).resolves.toMatchObject({ ingestedMessageCount: 1 });
    expect(ingestedParticipantPersonIds()).toEqual([undefined, 'priya-id']);
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
  });

  it('sets the profile picture of matched and created people after ingesting messages', async () => {
    const priyaWithPicture = {
      ...PRIYA,
      public_picture_url: 'https://media.licdn.com/priya.jpg',
    };

    await ingest({
      chat: { ...ONE_TO_ONE_CHAT, user: priyaWithPicture },
      counterparts: [priyaWithPicture],
    });

    expect(
      mocks.setMissingLinkedinPersonAvatars,
    ).toHaveBeenCalledExactlyOnceWith({
      avatars: [
        {
          personId: 'created-id',
          pictureUrl: 'https://media.licdn.com/priya.jpg',
        },
      ],
      deadlineAtMs: DEADLINE_AT_MS,
    });
    expect(mocks.ingestMessages.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.setMissingLinkedinPersonAvatars.mock.invocationCallOrder[0],
    );
  });

  it('names the conversation after the other person', async () => {
    await ingest();

    expect(mocks.ingestMessages.mock.calls[0][0].messages[0].subject).toBe(
      'Priya Nair',
    );
  });

  it('imports a group chat with a known member under its name', async () => {
    mocks.matchLinkedinParticipantPersonId.mockResolvedValue('priya-id');

    await expect(ingest({ chat: GROUP_CHAT })).resolves.toMatchObject({
      ingestedMessageCount: 1,
    });
    expect(mocks.ingestMessages.mock.calls[0][0].messages[0].subject).toBe(
      'Q4 hiring',
    );
  });

  it('skips a group chat where nobody is in Twenty, even with All chats', async () => {
    await expect(ingest({ chat: GROUP_CHAT })).resolves.toMatchObject({
      ingestedMessageCount: 0,
    });
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
  });

  it('skips group chats when they are not imported', async () => {
    mocks.matchLinkedinParticipantPersonId.mockResolvedValue('priya-id');

    await expect(
      ingest({
        chat: GROUP_CHAT,
        settings: {
          ...DEFAULT_LINKEDIN_SETTINGS,
          areGroupChatsImported: false,
        },
      }),
    ).resolves.toMatchObject({ ingestedMessageCount: 0 });
    expect(mocks.matchLinkedinParticipantPersonId).not.toHaveBeenCalled();
    expect(mocks.resolveCounterpart).not.toHaveBeenCalled();
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

  it('creates nobody when the public profile URL is unknown', async () => {
    await ingest({
      counterparts: [{ ...PRIYA, public_identifier: undefined }],
    });

    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
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
    ).resolves.toMatchObject({ ingestedMessageCount: 0 });
    expect(mocks.createLinkedinPerson).not.toHaveBeenCalled();
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
    expect(mocks.importLinkedinMessageAttachments).not.toHaveBeenCalled();
  });

  it('re-ingests a message with its uploaded attachments', async () => {
    const message = {
      ...buildMessage(true),
      attachments: [
        { id: 'attachment-1', type: 'img' as const, mimetype: 'image/png' },
      ],
    };
    const attachments = [{ fileId: 'file-1', label: 'linkedin-image.png' }];

    mocks.importLinkedinMessageAttachments.mockImplementation(
      async ({
        onMessageAttachments,
      }: {
        onMessageAttachments: (messageAttachments: {
          messageExternalId: string;
          attachments: { fileId: string; label: string }[];
        }) => Promise<void>;
      }) => {
        await onMessageAttachments({
          messageExternalId: message.id,
          attachments,
        });

        return 1;
      },
    );

    await expect(ingest({ messages: [message] })).resolves.toMatchObject({
      ingestedMessageCount: 1,
      importedAttachmentCount: 1,
    });
    expect(
      mocks.importLinkedinMessageAttachments,
    ).toHaveBeenCalledExactlyOnceWith({
      unipileAccountId: 'acc_1',
      messages: [message],
      deadlineAtMs: DEADLINE_AT_MS,
      onMessageAttachments: expect.any(Function),
    });
    expect(mocks.ingestMessages).toHaveBeenCalledTimes(2);
    expect(
      mocks.ingestMessages.mock.calls[0][0].messages[0],
    ).not.toHaveProperty('attachments');
    expect(mocks.ingestMessages.mock.calls[1][0]).toEqual({
      messageChannelId: 'channel-id',
      messages: [
        {
          ...mocks.ingestMessages.mock.calls[0][0].messages[0],
          attachments,
        },
      ],
    });
  });

  it('does not download the attachments of a message that already has some', async () => {
    mocks.ingestMessages.mockImplementation(
      async ({ messages }: { messages: { externalId: string }[] }) =>
        messages.map(({ externalId }) => ({
          externalId,
          messageId: `id-${externalId}`,
          messageThreadId: 'thread-id',
          hasAttachments: true,
        })),
    );

    await ingest();

    expect(mocks.importLinkedinMessageAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [] }),
    );
  });
});
