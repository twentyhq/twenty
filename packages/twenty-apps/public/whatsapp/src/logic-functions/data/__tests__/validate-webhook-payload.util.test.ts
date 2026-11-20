import * as crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validateWebhookPayload } from 'src/logic-functions/data/validate-webhook-payload.util';

const APP_SECRET = 'app-secret';
const PAYLOAD = '{"object":"whatsapp_business_account"}';
const VALID_SIGNATURE = `sha256=${crypto.createHmac('sha256', APP_SECRET).update(PAYLOAD).digest('hex')}`;

describe('validateWebhookPayload', () => {
  it('should accept a payload signed with the app secret', () => {
    expect(validateWebhookPayload({ signature: VALID_SIGNATURE, payload: PAYLOAD, appSecret: APP_SECRET })).toBe(true);
  });

  it('should reject a payload signed with another secret', () => {
    expect(validateWebhookPayload({ signature: VALID_SIGNATURE, payload: PAYLOAD, appSecret: 'other-secret' })).toBe(false);
  });

  it('should reject a tampered payload', () => {
    expect(
      validateWebhookPayload({ signature: VALID_SIGNATURE, payload: `${PAYLOAD} `, appSecret: APP_SECRET }),
    ).toBe(false);
  });

  it('should reject a signature of the wrong length', () => {
    expect(validateWebhookPayload({ signature: 'sha256=abc', payload: PAYLOAD, appSecret: APP_SECRET })).toBe(false);
  });
});
