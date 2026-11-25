import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { decodeLinkedinConnectFlow } from 'src/logic-functions/utils/decode-linkedin-connect-flow.util';
import { encodeLinkedinConnectFlow } from 'src/logic-functions/utils/encode-linkedin-connect-flow.util';

const FLOW: LinkedinConnectFlow = {
  callbackUrl: 'https://api.twenty.com/auth/apps/custom/callback?state=signed',
  expiresAtMs: Date.now() + 60_000,
  pendingCheckpoint: {
    intentId: 'intent_1',
    checkpoint: { type: 'OTP', channel: 'EMAIL' },
  },
};

describe('decodeLinkedinConnectFlow', () => {
  beforeEach(() => {
    vi.stubEnv('UNIPILE_API_KEY', 'unipile-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads back a flow this app signed', () => {
    expect(decodeLinkedinConnectFlow(encodeLinkedinConnectFlow(FLOW))).toEqual(
      FLOW,
    );
  });

  it('rejects a flow whose content was changed after signing', () => {
    const [, signature] = encodeLinkedinConnectFlow(FLOW).split('.');
    const forgedFlow = Buffer.from(
      JSON.stringify({ ...FLOW, callbackUrl: 'https://attacker.example' }),
    ).toString('base64url');

    expect(decodeLinkedinConnectFlow(`${forgedFlow}.${signature}`)).toBeNull();
  });

  it('rejects a flow signed with another key', () => {
    const flowToken = encodeLinkedinConnectFlow(FLOW);

    vi.stubEnv('UNIPILE_API_KEY', 'another-key');

    expect(decodeLinkedinConnectFlow(flowToken)).toBeNull();
  });

  it('rejects an expired flow', () => {
    expect(
      decodeLinkedinConnectFlow(
        encodeLinkedinConnectFlow({ ...FLOW, expiresAtMs: Date.now() - 1 }),
      ),
    ).toBeNull();
  });

  it.each([undefined, '', 'not-a-flow', 'payload.'])(
    'rejects the malformed flow %j',
    (flowToken) => {
      expect(decodeLinkedinConnectFlow(flowToken)).toBeNull();
    },
  );
});
