import { getAppSendIdempotencyKey } from '@/activities/emails/utils/getAppSendIdempotencyKey';

const PENDING_APP_SEND = {
  emailKey: '{"subject":"Re: Hello"}',
  idempotencyKey: 'a3b9a1b4-5e0e-4b6b-9a6f-1d1f4c1c6a10',
};

describe('getAppSendIdempotencyKey', () => {
  it('reuses the key when retrying the same email', () => {
    expect(
      getAppSendIdempotencyKey({
        pendingAppSend: PENDING_APP_SEND,
        emailKey: PENDING_APP_SEND.emailKey,
      }),
    ).toBe(PENDING_APP_SEND.idempotencyKey);
  });

  it('uses a new key once the email changes', () => {
    const idempotencyKey = getAppSendIdempotencyKey({
      pendingAppSend: PENDING_APP_SEND,
      emailKey: '{"subject":"Re: Hello again"}',
    });

    expect(idempotencyKey).not.toBe(PENDING_APP_SEND.idempotencyKey);
    expect(idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('uses a new key for a first send', () => {
    expect(
      getAppSendIdempotencyKey({
        pendingAppSend: null,
        emailKey: PENDING_APP_SEND.emailKey,
      }),
    ).toMatch(/^[0-9a-f-]{36}$/);
  });
});
