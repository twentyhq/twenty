import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  getPersonLinkedinLink: vi.fn(),
  getUnipileUser: vi.fn(),
  startUnipileChatOrThrow: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
}));

vi.mock('src/logic-functions/utils/get-person-linkedin-link.util', () => ({
  getPersonLinkedinLink: mocks.getPersonLinkedinLink,
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

vi.mock('src/unipile/utils/start-unipile-chat-or-throw.util', () => ({
  startUnipileChatOrThrow: mocks.startUnipileChatOrThrow,
}));

const { linkedinStartConversationHandler } =
  await import('src/logic-functions/linkedin-start-conversation');

const PERSON_ID = '20202020-0000-4000-8000-000000000001';

const buildPayload = (handle: string | null = null) => ({
  messagingProviderName: 'linkedin-messaging',
  connectedAccountId: 'connected-account-id',
  messageChannelId: 'channel-id',
  text: 'Hi Grace, nice to meet you',
  idempotencyKey: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  recipients: [{ personId: PERSON_ID, displayName: 'Grace Hopper', handle }],
});

describe('linkedinStartConversationHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.getPersonLinkedinLink.mockResolvedValue(
      'https://www.linkedin.com/in/Grace-Hopper/',
    );
    mocks.getUnipileUser.mockResolvedValue({
      id: 'ACoAAA123',
      display_name: 'Grace Hopper',
      public_identifier: 'grace-hopper',
    });
    mocks.startUnipileChatOrThrow.mockResolvedValue({
      chatId: 'chat-1',
      messageId: 'message-1',
    });
  });

  it("starts a chat with the person's LinkedIn profile and returns the new thread", async () => {
    await expect(
      linkedinStartConversationHandler(buildPayload()),
    ).resolves.toEqual({
      externalId: 'message-1',
      threadExternalId: 'chat-1',
      recipients: [
        {
          personId: PERSON_ID,
          handle: 'https://www.linkedin.com/in/grace-hopper',
        },
      ],
    });

    expect(mocks.getPersonLinkedinLink).toHaveBeenCalledExactlyOnceWith(
      PERSON_ID,
    );
    expect(mocks.getUnipileUser).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      userId: 'Grace-Hopper',
      deadlineAtMs: expect.any(Number),
    });
    expect(mocks.startUnipileChatOrThrow).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      userId: 'ACoAAA123',
      text: 'Hi Grace, nice to meet you',
    });
  });

  it('uses the public profile handle Twenty already knows instead of the LinkedIn field', async () => {
    const knownHandle = 'linkedin.com/in/grace-hopper';

    await expect(
      linkedinStartConversationHandler(buildPayload(knownHandle)),
    ).resolves.toMatchObject({
      recipients: [{ personId: PERSON_ID, handle: knownHandle }],
    });

    expect(mocks.getPersonLinkedinLink).not.toHaveBeenCalled();
    expect(mocks.getUnipileUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'grace-hopper' }),
    );
  });

  it('reads the LinkedIn field when the known handle is a lowercased internal profile id', async () => {
    const knownHandle = 'linkedin.com/in/acoaaa123';

    mocks.getPersonLinkedinLink.mockResolvedValue(
      'https://www.linkedin.com/in/ACoAAA123',
    );

    await expect(
      linkedinStartConversationHandler(buildPayload(knownHandle)),
    ).resolves.toMatchObject({
      recipients: [{ personId: PERSON_ID, handle: knownHandle }],
    });

    expect(mocks.getPersonLinkedinLink).toHaveBeenCalledExactlyOnceWith(
      PERSON_ID,
    );
    expect(mocks.getUnipileUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'ACoAAA123' }),
    );
  });

  it('refuses a known internal profile id when the LinkedIn field is empty', async () => {
    mocks.getPersonLinkedinLink.mockResolvedValue(null);

    await expect(
      linkedinStartConversationHandler(
        buildPayload('linkedin.com/in/acoaaa123'),
      ),
    ).rejects.toThrow(
      `Person ${PERSON_ID} has no LinkedIn profile URL: add one to start a LinkedIn conversation`,
    );
    expect(mocks.getUnipileUser).not.toHaveBeenCalled();
  });

  it('refuses a person without a LinkedIn profile URL', async () => {
    mocks.getPersonLinkedinLink.mockResolvedValue(null);

    await expect(
      linkedinStartConversationHandler(buildPayload()),
    ).rejects.toThrow(
      `Person ${PERSON_ID} has no LinkedIn profile URL: add one to start a LinkedIn conversation`,
    );
    expect(mocks.startUnipileChatOrThrow).not.toHaveBeenCalled();
  });

  it('refuses a group conversation', async () => {
    const payload = buildPayload();

    await expect(
      linkedinStartConversationHandler({
        ...payload,
        recipients: [...payload.recipients, ...payload.recipients],
      }),
    ).rejects.toThrow(
      'A LinkedIn conversation can only be started with one person',
    );
    expect(mocks.startUnipileChatOrThrow).not.toHaveBeenCalled();
  });

  it('refuses to start through a connection without a Unipile account', async () => {
    mocks.getConnection.mockResolvedValue({ externalAccountId: null });

    await expect(
      linkedinStartConversationHandler(buildPayload()),
    ).rejects.toThrow(
      'LinkedIn connection connected-account-id has no Unipile account',
    );
    expect(mocks.startUnipileChatOrThrow).not.toHaveBeenCalled();
  });

  it('fails the start when Unipile does', async () => {
    mocks.startUnipileChatOrThrow.mockRejectedValue(
      new Error('Unipile start chat failed (403): Forbidden'),
    );

    await expect(
      linkedinStartConversationHandler(buildPayload()),
    ).rejects.toThrow('Unipile start chat failed (403): Forbidden');
  });
});
