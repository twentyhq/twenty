import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { updateSlackMessageViaResponseUrl } from 'src/logic-functions/utils/update-slack-message-via-response-url';

const RESPONSE_URL = 'https://hooks.slack.com/actions/T1/123/abc';

const fetchMock = vi.fn();

describe('updateSlackMessageViaResponseUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should replace the original message on Slack own host', async () => {
    expect(
      await updateSlackMessageViaResponseUrl({
        responseUrl: RESPONSE_URL,
        text: 'Thanks',
      }),
    ).toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalledWith(RESPONSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_original: true, text: 'Thanks' }),
    });
  });

  it('should refuse a response url pointing somewhere other than Slack', async () => {
    const result = await updateSlackMessageViaResponseUrl({
      responseUrl: 'https://attacker.example.com/collect',
      text: 'Thanks',
    });

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should refuse a look-alike host that only ends with the Slack domain', async () => {
    const result = await updateSlackMessageViaResponseUrl({
      responseUrl: 'https://hooks.slack.com.attacker.example/collect',
      text: 'Thanks',
    });

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should refuse a plain http response url', async () => {
    const result = await updateSlackMessageViaResponseUrl({
      responseUrl: 'http://hooks.slack.com/actions/T1/123/abc',
      text: 'Thanks',
    });

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should report a missing response url instead of throwing', async () => {
    const result = await updateSlackMessageViaResponseUrl({
      responseUrl: undefined,
      text: 'Thanks',
    });

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should report a network failure instead of throwing', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    expect(
      await updateSlackMessageViaResponseUrl({
        responseUrl: RESPONSE_URL,
        text: 'Thanks',
      }),
    ).toEqual({ success: false, error: 'network down' });
  });
});
