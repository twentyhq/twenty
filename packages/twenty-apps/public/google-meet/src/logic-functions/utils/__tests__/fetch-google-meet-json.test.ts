import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GoogleMeetRequestError } from 'src/logic-functions/types/google-meet-request-error.type';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

const REQUEST_URL = 'https://meet.googleapis.com/v2/conferenceRecords';

const fetchMock =
  vi.fn<
    (
      url: string,
      init: { headers: Record<string, string> },
    ) => Promise<Response>
  >();

const fetchConferenceRecords = () =>
  fetchGoogleMeetJson<{ conferenceRecords: string[] }>({
    accessToken: 'token',
    url: REQUEST_URL,
  });

describe('fetchGoogleMeetJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should send the access token and return the response body', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ conferenceRecords: ['first'] })),
    );

    await expect(fetchConferenceRecords()).resolves.toEqual({
      conferenceRecords: ['first'],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(REQUEST_URL);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer token',
    );
  });

  it('should retry after the delay Google asks for when rate limited', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('{}', { status: 429, headers: { 'Retry-After': '7' } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ conferenceRecords: [] })),
      );

    const request = fetchConferenceRecords();

    await vi.advanceTimersByTimeAsync(6_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toEqual({ conferenceRecords: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should stop retrying after four attempts', async () => {
    fetchMock.mockImplementation(
      async () => new Response('{}', { status: 503 }),
    );

    const request = fetchConferenceRecords();
    const expectation = expect(request).rejects.toMatchObject({
      httpStatus: 503,
    });

    await vi.runAllTimersAsync();
    await expectation;
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should not retry a refused request and report the Google status', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { message: 'Denied', status: 'PERMISSION_DENIED' },
        }),
        { status: 403 },
      ),
    );

    const error = await fetchConferenceRecords().catch(
      (caughtError: unknown) => caughtError,
    );

    expect(error).toBeInstanceOf(GoogleMeetRequestError);
    expect(error).toMatchObject({
      message: 'Google Meet request failed (403 PERMISSION_DENIED): Denied',
      httpStatus: 403,
      googleStatus: 'PERMISSION_DENIED',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
