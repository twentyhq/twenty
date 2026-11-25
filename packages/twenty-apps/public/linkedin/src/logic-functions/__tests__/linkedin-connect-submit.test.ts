import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { type LinkedinConnectSubmission } from 'src/logic-functions/types/linkedin-connect-submission.type';
import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';

const mocks = vi.hoisted(() => ({
  startUnipileLinkedinAuthIntent: vi.fn(),
  solveUnipileCheckpoint: vi.fn(),
  waitForUnipileCheckpoint: vi.fn(),
  createUnipileHostedAuthLink: vi.fn(),
}));

vi.mock('src/unipile/utils/start-unipile-linkedin-auth-intent.util', () => ({
  startUnipileLinkedinAuthIntent: mocks.startUnipileLinkedinAuthIntent,
}));

vi.mock('src/unipile/utils/solve-unipile-checkpoint.util', () => ({
  solveUnipileCheckpoint: mocks.solveUnipileCheckpoint,
}));

vi.mock('src/unipile/utils/wait-for-unipile-checkpoint.util', () => ({
  waitForUnipileCheckpoint: mocks.waitForUnipileCheckpoint,
}));

vi.mock('src/unipile/utils/create-unipile-hosted-auth-link.util', () => ({
  createUnipileHostedAuthLink: mocks.createUnipileHostedAuthLink,
}));

const { linkedinConnectSubmitHandler } =
  await import('src/logic-functions/linkedin-connect-submit');
const { decodeLinkedinConnectFlow } =
  await import('src/logic-functions/utils/decode-linkedin-connect-flow.util');
const { encodeLinkedinConnectFlow } =
  await import('src/logic-functions/utils/encode-linkedin-connect-flow.util');
const { UnipileRequestError } =
  await import('src/unipile/utils/request-unipile.util');

const CALLBACK_URL = 'https://api.twenty.com/callback?state=signed.state';

const SIGN_IN_FLOW: LinkedinConnectFlow = {
  callbackUrl: CALLBACK_URL,
  expiresAtMs: Date.now() + 60_000,
  pendingCheckpoint: null,
};

const buildCheckpointFlow = (
  checkpoint: UnipileAuthCheckpoint,
): LinkedinConnectFlow => ({
  ...SIGN_IN_FLOW,
  pendingCheckpoint: { intentId: 'intent_1', checkpoint },
});

const submit = async ({
  flow,
  headers = {},
  ...fields
}: Omit<LinkedinConnectSubmission, 'flow'> & {
  flow: LinkedinConnectFlow;
  headers?: Record<string, string>;
}): Promise<{ status: number | undefined; page: string }> => {
  const response = await linkedinConnectSubmitHandler({
    body: { ...fields, flow: encodeLinkedinConnectFlow(flow) },
    headers,
  });

  return { status: response.status, page: String(response.body) };
};

const readSubmittedFlow = (page: string): LinkedinConnectFlow | null =>
  decodeLinkedinConnectFlow(/name="flow"\s+value="([^"]+)"/.exec(page)?.[1]);

describe('linkedinConnectSubmitHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('refuses a submission whose flow this app did not sign', async () => {
    const response = await linkedinConnectSubmitHandler({
      body: { flow: 'forged.flow', username: 'ada', password: 'secret' },
      headers: {},
    });

    expect(response.status).toBe(400);
    expect(mocks.startUnipileLinkedinAuthIntent).not.toHaveBeenCalled();
  });

  it('sends the member back to Twenty with the account once LinkedIn signs them in', async () => {
    mocks.startUnipileLinkedinAuthIntent.mockResolvedValue({
      object: 'Account',
      id: 'acc_1',
    });

    const { page } = await submit({
      flow: SIGN_IN_FLOW,
      username: ' ada@example.com ',
      password: 'secret',
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });

    expect(mocks.startUnipileLinkedinAuthIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'ada@example.com',
        password: 'secret',
        endUserIp: '203.0.113.7',
      }),
    );
    expect(page).toContain(
      'href="https://api.twenty.com/callback?state=signed.state&amp;account_id=acc_1"',
    );
  });

  it('never writes the password into the page it answers with', async () => {
    mocks.startUnipileLinkedinAuthIntent.mockRejectedValue(
      new UnipileRequestError('Invalid credentials', 401, 'api/unknown'),
    );

    const { page } = await submit({
      flow: SIGN_IN_FLOW,
      username: 'ada@example.com',
      password: 'correct-horse-battery',
    });

    expect(page).not.toContain('correct-horse-battery');
  });

  it('asks again for credentials LinkedIn refuses', async () => {
    mocks.startUnipileLinkedinAuthIntent.mockRejectedValue(
      new UnipileRequestError(
        'Invalid credentials',
        401,
        'provider/invalid_credentials',
      ),
    );

    const { page } = await submit({
      flow: SIGN_IN_FLOW,
      username: 'ada@example.com',
      password: 'wrong',
    });

    expect(page).toContain('LinkedIn did not accept this email or password.');
    expect(page).toContain('value="ada@example.com"');
    expect(page).toContain('name="password"');
  });

  it('asks for credentials without calling LinkedIn when one is missing', async () => {
    const { page } = await submit({ flow: SIGN_IN_FLOW, username: 'ada' });

    expect(page).toContain('Enter your email or phone and your password.');
    expect(mocks.startUnipileLinkedinAuthIntent).not.toHaveBeenCalled();
  });

  it('ignores form fields that are not text instead of writing them into the page', async () => {
    const response = await linkedinConnectSubmitHandler({
      body: {
        flow: encodeLinkedinConnectFlow(SIGN_IN_FLOW),
        username: { safeHtml: '"><script>alert(1)</script>' },
        password: ['secret'],
      },
      headers: {},
    });

    expect(response.body).toContain(
      'Enter your email or phone and your password.',
    );
    expect(response.body).not.toContain('alert(1)');
    expect(mocks.startUnipileLinkedinAuthIntent).not.toHaveBeenCalled();
  });

  it('asks for the code LinkedIn sent and keeps the intent for the next step', async () => {
    mocks.startUnipileLinkedinAuthIntent.mockResolvedValue({
      object: 'AuthenticationCheckpoint',
      intent_id: 'intent_1',
      checkpoint: { type: 'OTP', channel: 'EMAIL' },
    });

    const { page } = await submit({
      flow: SIGN_IN_FLOW,
      username: 'ada@example.com',
      password: 'secret',
    });

    expect(page).toContain('LinkedIn emailed you a verification code.');
    expect(readSubmittedFlow(page)).toMatchObject(
      buildCheckpointFlow({ type: 'OTP', channel: 'EMAIL' }),
    );
  });

  it('solves a code checkpoint with the code the member typed', async () => {
    mocks.solveUnipileCheckpoint.mockResolvedValue({
      object: 'Account',
      id: 'acc_1',
    });

    const { page } = await submit({
      flow: buildCheckpointFlow({ type: '2FA', platform: 'APP' }),
      action: 'solve',
      code: ' 123456 ',
    });

    expect(mocks.solveUnipileCheckpoint).toHaveBeenCalledWith(
      expect.objectContaining({ intentId: 'intent_1', code: '123456' }),
    );
    expect(page).toContain('account_id=acc_1');
  });

  it('asks for the code again when LinkedIn refuses it', async () => {
    mocks.solveUnipileCheckpoint.mockRejectedValue(
      new UnipileRequestError('Invalid code', 400),
    );

    const flow = buildCheckpointFlow({ type: 'OTP', channel: 'SMS' });
    const { page } = await submit({ flow, action: 'solve', code: '000000' });

    expect(page).toContain('LinkedIn did not accept this code.');
    expect(readSubmittedFlow(page)).toEqual(flow);
  });

  it('shows the number to pick and keeps waiting while the member approves in the LinkedIn app', async () => {
    mocks.waitForUnipileCheckpoint.mockResolvedValue(null);

    const flow = buildCheckpointFlow({ type: 'IN_APP_VALIDATION', code: '42' });
    const { page } = await submit({ flow, action: 'wait' });

    expect(mocks.waitForUnipileCheckpoint).toHaveBeenCalledWith(
      expect.objectContaining({ intentId: 'intent_1' }),
    );
    expect(page).toContain('<strong>42</strong>');
    expect(page).toContain('name="action" value="wait"');
    expect(readSubmittedFlow(page)).toEqual(flow);
  });

  it('connects the account once the member approved in the LinkedIn app', async () => {
    mocks.waitForUnipileCheckpoint.mockResolvedValue({
      object: 'Account',
      id: 'acc_1',
    });

    const { page } = await submit({
      flow: buildCheckpointFlow({ type: 'IN_APP_VALIDATION' }),
      action: 'wait',
    });

    expect(page).toContain('account_id=acc_1');
  });

  it('starts over when the approval wait fails', async () => {
    mocks.waitForUnipileCheckpoint.mockRejectedValue(
      new UnipileRequestError('Intent expired', 400),
    );

    const { page } = await submit({
      flow: buildCheckpointFlow({ type: 'IN_APP_VALIDATION' }),
      action: 'wait',
    });

    expect(page).toContain('LinkedIn did not confirm the sign-in.');
    expect(readSubmittedFlow(page)).toEqual(SIGN_IN_FLOW);
  });

  it.each([
    {
      object: 'AuthenticationCheckpoint',
      intent_id: 'intent_1',
      checkpoint: { type: 'CAPTCHA', public_key: 'key', data: 'blob' },
    },
    {
      object: 'AuthenticationCheckpoint',
      intent_id: 'intent_1',
      checkpoint: { type: 'PHONE_REGISTER' },
    },
    { object: 'OauthUrl', url: 'https://provider.example' },
  ])(
    'hands the sign-in over to the hosted page on $checkpoint.type $object',
    async (result) => {
      mocks.startUnipileLinkedinAuthIntent.mockResolvedValue(result);
      mocks.createUnipileHostedAuthLink.mockResolvedValue(
        'https://auth.unipile.com/link_1',
      );

      const { page } = await submit({
        flow: SIGN_IN_FLOW,
        username: 'ada@example.com',
        password: 'secret',
      });

      expect(mocks.createUnipileHostedAuthLink).toHaveBeenCalledWith({
        provider: 'linkedin',
        callbackUrl: CALLBACK_URL,
      });
      expect(page).toContain('href="https://auth.unipile.com/link_1"');
    },
  );
});
