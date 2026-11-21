import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphApiError } from 'src/logic-functions/data/graph-api-error';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';

const { reportConnectionAuthFailure, sendInboxNotification } = vi.hoisted(
  () => ({
    reportConnectionAuthFailure: vi.fn(),
    sendInboxNotification: vi.fn(),
  }),
);

vi.mock('twenty-sdk/logic-function', () => ({ reportConnectionAuthFailure }));
vi.mock('src/logic-functions/data/send-inbox-notification.util', () => ({
  sendInboxNotification,
}));

describe('withConnectionAuthFailureReport', () => {
  beforeEach(() => {
    reportConnectionAuthFailure.mockReset();
    sendInboxNotification.mockReset();
  });

  it('reports the connection when Meta says the token is invalid', async () => {
    await expect(
      withConnectionAuthFailureReport('connection-1', async () => {
        throw new GraphApiError('Messenger API error 190: token expired', 190);
      }),
    ).rejects.toThrow('token expired');

    expect(reportConnectionAuthFailure).toHaveBeenCalledWith({
      connectionId: 'connection-1',
      reason: 'Messenger API error 190: token expired',
    });
    expect(sendInboxNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Messenger needs to be reconnected' }),
    );
  });

  it('does not report other Graph API errors', async () => {
    await expect(
      withConnectionAuthFailureReport('connection-1', async () => {
        throw new GraphApiError('Messenger API error 613: rate limit', 613);
      }),
    ).rejects.toThrow('rate limit');

    expect(reportConnectionAuthFailure).not.toHaveBeenCalled();
    expect(sendInboxNotification).not.toHaveBeenCalled();
  });

  it('returns the result of a successful request', async () => {
    await expect(
      withConnectionAuthFailureReport('connection-1', async () => 'pages'),
    ).resolves.toBe('pages');
  });
});
