import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_WHATSAPP_SETTINGS } from 'src/constants/default-whatsapp-settings.constant';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

const mocks = vi.hoisted(() => ({
  ingestMessages: vi.fn(),
  findPersonIdsByWhatsappPhone: vi.fn(),
  createWhatsappPerson: vi.fn(),
  importWhatsappMessageAttachments: vi.fn(),
  setMissingWhatsappPersonAvatars: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  ingestMessages: mocks.ingestMessages,
}));

vi.mock(
  'src/logic-functions/utils/find-person-ids-by-whatsapp-phone.util',
  () => ({
    findPersonIdsByWhatsappPhone: mocks.findPersonIdsByWhatsappPhone,
  }),
);

vi.mock('src/logic-functions/utils/create-whatsapp-person.util', () => ({
  createWhatsappPerson: mocks.createWhatsappPerson,
}));

vi.mock(
  'src/logic-functions/utils/import-whatsapp-message-attachments.util',
  () => ({
    importWhatsappMessageAttachments: mocks.importWhatsappMessageAttachments,
  }),
);

vi.mock(
  'src/logic-functions/utils/set-missing-whatsapp-person-avatars.util',
  () => ({
    setMissingWhatsappPersonAvatars: mocks.setMissingWhatsappPersonAvatars,
  }),
);

const { ingestWhatsappMessages } =
  await import('src/logic-functions/utils/ingest-whatsapp-messages.util');

const DEADLINE_AT_MS = Date.parse('2026-10-29T08:00:00.000Z');

const CHANNEL_HANDLE = '+33611111111';

const PRIYA_HANDLE = '+33622222222';

const SAM_HANDLE = '+33633333333';

const PRIYA: UnipileUser = {
  id: '33622222222@s.whatsapp.net',
  display_name: 'Priya Nair',
  public_identifier: '33622222222',
  public_picture_url: 'https://pictures.example/priya.jpg',
};

const SAM: UnipileUser = {
  id: '199912345678901@lid',
  display_name: 'Sam Okafor',
  public_identifier: '33633333333',
};

const HIDDEN_NUMBER_USER: UnipileUser = {
  id: '199900000000001@lid',
  display_name: 'Lee',
};

const buildMessage = ({
  isSender,
  sender = PRIYA,
}: {
  isSender: boolean;
  sender?: UnipileUser;
}): UnipileMessage => ({
  id: `message-${isSender ? 'sent' : 'received'}`,
  chat_id: 'chat-1',
  sender_id: isSender ? '33611111111@s.whatsapp.net' : sender.id,
  sender: isSender ? undefined : sender,
  text: 'Hello',
  timestamp: '2026-10-29T07:44:08.382Z',
  is_sender: isSender,
  is_deleted: false,
  is_event: false,
  provider: 'whatsapp',
});

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
  participants: [
    { is_self: false, user: PRIYA },
    { is_self: false, user: SAM },
  ],
};

const ingest = ({
  settings = DEFAULT_WHATSAPP_SETTINGS,
  messages = [buildMessage({ isSender: true })],
  chat = ONE_TO_ONE_CHAT,
  counterparts = [PRIYA],
}: {
  counterparts?: UnipileUser[];
  settings?: typeof DEFAULT_WHATSAPP_SETTINGS;
  messages?: UnipileMessage[];
  chat?: typeof ONE_TO_ONE_CHAT | typeof GROUP_CHAT;
} = {}) =>
  ingestWhatsappMessages({
    unipileAccountId: 'acc_1',
    attachmentDeadlineAtMs: DEADLINE_AT_MS,
    channel: { id: 'channel-id', handle: CHANNEL_HANDLE },
    settings,
    chat,
    counterparts,
    messages,
  });

const setPeopleInTwenty = (personIdByHandle: Record<string, string>) =>
  mocks.findPersonIdsByWhatsappPhone.mockImplementation(
    async (handle: string) =>
      handle in personIdByHandle ? [personIdByHandle[handle]] : [],
  );

const ingestedParticipants = () =>
  mocks.ingestMessages.mock.calls[0][0].messages[0].participants;

describe('ingestWhatsappMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setPeopleInTwenty({});
    mocks.createWhatsappPerson.mockResolvedValue('created-person-id');
    mocks.importWhatsappMessageAttachments.mockResolvedValue(0);
    mocks.ingestMessages.mockImplementation(
      async ({ messages }: { messages: { externalId: string }[] }) =>
        messages.map(({ externalId }) => ({
          externalId,
          messageId: `id-${externalId}`,
          messageThreadId: 'thread-id',
          hasAttachments: false,
        })),
    );
  });

  it('ingests a message under the phone numbers of its participants, linked to the person who has that number', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await expect(ingest()).resolves.toMatchObject({
      ingestedMessageCount: 1,
      matchedPersonCount: 1,
      createdPersonCount: 0,
    });
    expect(ingestedParticipants()).toEqual([
      { role: 'FROM', handle: CHANNEL_HANDLE },
      {
        role: 'TO',
        handle: PRIYA_HANDLE,
        displayName: 'Priya Nair',
        personId: 'priya-person-id',
      },
    ]);
    expect(mocks.createWhatsappPerson).not.toHaveBeenCalled();
  });

  it('names the conversation after the other person', async () => {
    await ingest();

    expect(mocks.ingestMessages.mock.calls[0][0].messages[0].subject).toBe(
      'Priya Nair',
    );
  });

  it('creates a person for an unknown number the member messaged', async () => {
    await expect(ingest()).resolves.toMatchObject({ createdPersonCount: 1 });
    expect(mocks.createWhatsappPerson).toHaveBeenCalledExactlyOnceWith({
      firstName: 'Priya',
      lastName: 'Nair',
      handle: PRIYA_HANDLE,
    });
    expect(ingestedParticipants()[1].personId).toBe('created-person-id');
  });

  it('creates nobody for a number that only wrote to the member, with the default policy', async () => {
    await expect(
      ingest({ messages: [buildMessage({ isSender: false })] }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 1,
      createdPersonCount: 0,
    });
    expect(mocks.createWhatsappPerson).not.toHaveBeenCalled();
  });

  it('creates nobody for a contact WhatsApp only knows by their number', async () => {
    await expect(
      ingest({
        counterparts: [{ ...PRIYA, display_name: '+33 6 22 22 22 22' }],
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 1,
      createdPersonCount: 0,
    });
    expect(mocks.createWhatsappPerson).not.toHaveBeenCalled();
  });

  it('still imports the message when the person cannot be created', async () => {
    mocks.createWhatsappPerson.mockRejectedValue(
      new Error('Provided phone number is invalid'),
    );

    await expect(ingest()).resolves.toMatchObject({
      ingestedMessageCount: 1,
      createdPersonCount: 0,
    });
    expect(ingestedParticipants()[1]).not.toHaveProperty('personId');
  });

  it('imports without creating anyone when the policy does not allow it', async () => {
    await expect(
      ingest({
        settings: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          contactAutoCreationPolicy: 'NONE',
        },
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 1,
      createdPersonCount: 0,
    });
    expect(mocks.createWhatsappPerson).not.toHaveBeenCalled();
  });

  it('skips chats with nobody already in Twenty with Contacts only', async () => {
    await expect(
      ingest({
        settings: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          importPolicy: 'CONTACTS_ONLY',
        },
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 0,
      skippedReason: 'NO_CONTACT',
    });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
    expect(mocks.createWhatsappPerson).not.toHaveBeenCalled();
  });

  it('imports a group chat with a known member under its name and creates the other members', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await expect(
      ingest({ chat: GROUP_CHAT, counterparts: [PRIYA, SAM] }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 1,
      matchedPersonCount: 1,
      createdPersonCount: 1,
    });
    expect(mocks.ingestMessages.mock.calls[0][0].messages[0].subject).toBe(
      'Q4 hiring',
    );
    expect(mocks.createWhatsappPerson).toHaveBeenCalledExactlyOnceWith({
      firstName: 'Sam',
      lastName: 'Okafor',
      handle: SAM_HANDLE,
    });
  });

  it('links a message received in a group to every member, so the thread shows on each of them', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await ingest({
      chat: GROUP_CHAT,
      counterparts: [PRIYA, SAM],
      messages: [buildMessage({ isSender: false, sender: PRIYA })],
      settings: {
        ...DEFAULT_WHATSAPP_SETTINGS,
        contactAutoCreationPolicy: 'SENT_AND_RECEIVED',
      },
    });

    expect(ingestedParticipants()).toEqual([
      expect.objectContaining({
        role: 'FROM',
        handle: PRIYA_HANDLE,
        personId: 'priya-person-id',
      }),
      { role: 'TO', handle: CHANNEL_HANDLE },
      expect.objectContaining({
        role: 'TO',
        handle: SAM_HANDLE,
        personId: 'created-person-id',
      }),
    ]);
  });

  it('creates a group member WhatsApp only knows by their number, named after that number', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await expect(
      ingest({
        chat: GROUP_CHAT,
        counterparts: [PRIYA, { ...SAM, display_name: '+33 6 33 33 33 33' }],
      }),
    ).resolves.toMatchObject({ createdPersonCount: 1 });
    expect(mocks.createWhatsappPerson).toHaveBeenCalledExactlyOnceWith({
      firstName: SAM_HANDLE,
      lastName: '',
      handle: SAM_HANDLE,
    });
  });

  it('skips a group chat where nobody is in Twenty, even with All chats', async () => {
    await expect(
      ingest({ chat: GROUP_CHAT, counterparts: [PRIYA, SAM] }),
    ).resolves.toMatchObject({ skippedReason: 'NO_CONTACT' });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });

  it('skips group chats when they are not imported', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await expect(
      ingest({
        chat: GROUP_CHAT,
        counterparts: [PRIYA, SAM],
        settings: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          areGroupChatsImported: false,
        },
      }),
    ).resolves.toMatchObject({ skippedReason: 'GROUP_CHATS_OFF' });
    expect(mocks.findPersonIdsByWhatsappPhone).not.toHaveBeenCalled();
  });

  it('skips a conversation the member did not select', async () => {
    await expect(
      ingest({
        settings: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          importPolicy: 'SELECTED',
          selectedChats: [{ id: 'chat-2', name: 'chat-2' }],
        },
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 0,
      skippedReason: 'NOT_SELECTED',
    });
    expect(mocks.findPersonIdsByWhatsappPhone).not.toHaveBeenCalled();
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });

  it('imports a selected group chat even when nobody in it is in Twenty and group chats are off', async () => {
    await expect(
      ingest({
        chat: GROUP_CHAT,
        counterparts: [PRIYA, SAM],
        settings: {
          ...DEFAULT_WHATSAPP_SETTINGS,
          importPolicy: 'SELECTED',
          selectedChats: [{ id: 'chat-2', name: 'chat-2' }],
          areGroupChatsImported: false,
        },
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 1,
      matchedPersonCount: 0,
    });
  });

  it('skips a chat with someone whose phone number WhatsApp hides', async () => {
    await expect(
      ingest({
        counterparts: [HIDDEN_NUMBER_USER],
        messages: [
          buildMessage({ isSender: true }),
          buildMessage({ isSender: false, sender: HIDDEN_NUMBER_USER }),
        ],
      }),
    ).resolves.toMatchObject({
      ingestedMessageCount: 0,
      skippedReason: 'NO_PHONE',
    });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });

  it('leaves out the group members whose phone number WhatsApp hides', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await ingest({
      chat: GROUP_CHAT,
      counterparts: [PRIYA, HIDDEN_NUMBER_USER],
    });

    expect(
      ingestedParticipants().map(
        (participant: { handle: string }) => participant.handle,
      ),
    ).toEqual([CHANNEL_HANDLE, PRIYA_HANDLE]);
  });

  it('reads no person for a page with no message to import', async () => {
    await expect(
      ingest({
        messages: [{ ...buildMessage({ isSender: true }), is_event: true }],
      }),
    ).resolves.toMatchObject({ skippedReason: 'NO_MESSAGES' });
    expect(mocks.findPersonIdsByWhatsappPhone).not.toHaveBeenCalled();
  });

  it('sets the profile picture of matched and created people after ingesting messages', async () => {
    setPeopleInTwenty({ [PRIYA_HANDLE]: 'priya-person-id' });

    await ingest({ chat: GROUP_CHAT, counterparts: [PRIYA, SAM] });

    expect(
      mocks.setMissingWhatsappPersonAvatars,
    ).toHaveBeenCalledExactlyOnceWith({
      avatars: [
        {
          personId: 'priya-person-id',
          pictureUrl: 'https://pictures.example/priya.jpg',
        },
      ],
      deadlineAtMs: DEADLINE_AT_MS,
    });
  });

  it('re-ingests a message with its uploaded attachments', async () => {
    const message = {
      ...buildMessage({ isSender: true }),
      attachments: [
        { id: 'attachment-1', type: 'img' as const, mimetype: 'image/png' },
      ],
    };
    const attachments = [{ fileId: 'file-1', label: 'whatsapp-image.png' }];

    mocks.importWhatsappMessageAttachments.mockImplementation(
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
      mocks.importWhatsappMessageAttachments,
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

    expect(mocks.importWhatsappMessageAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [] }),
    );
  });
});
