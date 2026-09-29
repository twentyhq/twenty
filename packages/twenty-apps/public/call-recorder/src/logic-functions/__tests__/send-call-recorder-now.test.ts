import { type RoutePayload } from 'twenty-sdk/define';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendCallRecorderNowHandler } from 'src/logic-functions/send-call-recorder-now';

const sendCallRecorderNowMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/flows/send-call-recorder-now.util', () => ({
  sendCallRecorderNow: sendCallRecorderNowMock,
}));

const buildRoutePayload = (
  body: object | null,
): RoutePayload<{ calendarEventIds?: string[] }> =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    rawBody: undefined,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  }) as never;

describe('sendCallRecorderNowHandler', () => {
  afterEach(() => {
    sendCallRecorderNowMock.mockReset();
  });

  it('reports an empty selection without sending anything', async () => {
    expect(await sendCallRecorderNowHandler(buildRoutePayload(null))).toEqual({
      outcome: 'nothing-selected',
    });
    expect(sendCallRecorderNowMock).not.toHaveBeenCalled();
  });

  it('refuses to send the recorder into several meetings at once', async () => {
    expect(
      await sendCallRecorderNowHandler(
        buildRoutePayload({
          calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
        }),
      ),
    ).toEqual({ outcome: 'single-calendar-event-required' });
    expect(sendCallRecorderNowMock).not.toHaveBeenCalled();
  });

  it('sends the recorder to the selected meeting and reports the outcome', async () => {
    sendCallRecorderNowMock.mockResolvedValue({
      status: 'skipped',
      reason: 'EVENT_NOT_UPCOMING',
    });

    expect(
      await sendCallRecorderNowHandler(
        buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
      ),
    ).toEqual({ outcome: 'skipped', reason: 'EVENT_NOT_UPCOMING' });
    expect(sendCallRecorderNowMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        calendarEventId: 'calendar-event-1',
        now: expect.any(Date),
      }),
    );
  });
});
