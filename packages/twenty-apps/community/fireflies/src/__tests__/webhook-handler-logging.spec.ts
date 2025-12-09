import { WebhookHandler } from '../webhook-handler';

describe('WebhookHandler log capture', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      FIREFLIES_WEBHOOK_SECRET: 'testsecret',
      FIREFLIES_API_KEY: '',
      TWENTY_API_KEY: '',
      CAPTURE_LOGS: 'false',
      LOG_LEVEL: 'silent',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('includes debug logs in response when CAPTURE_LOGS is true', async () => {
    process.env.CAPTURE_LOGS = 'true';

    const handler = new WebhookHandler();
    const result = await handler.handle(null);

    expect(result.success).toBe(false);
    expect(Array.isArray(result.debug)).toBe(true);
  });

  it('omits debug logs when CAPTURE_LOGS is false', async () => {
    process.env.CAPTURE_LOGS = 'false';

    const handler = new WebhookHandler();
    const result = await handler.handle(null);

    expect(result.debug).toBeUndefined();
  });
});

