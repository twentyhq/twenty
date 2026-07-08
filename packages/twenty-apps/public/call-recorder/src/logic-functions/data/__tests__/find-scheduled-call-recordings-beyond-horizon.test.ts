import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { findScheduledCallRecordingsBeyondHorizon } from 'src/logic-functions/data/find-scheduled-call-recordings-beyond-horizon.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

const NOW = new Date('2026-07-04T12:00:00.000Z');

type CallRecordingNode = {
  id: string;
  externalBotId?: string | null;
  calendarEvent?: { startsAt?: string | null } | null;
};

const buildPage = (
  callRecordings: CallRecordingNode[],
  { hasNextPage = false, endCursor = null as string | null } = {},
) => ({
  callRecordings: {
    pageInfo: { hasNextPage, endCursor },
    edges: callRecordings.map((node) => ({ node })),
  },
});

describe('findScheduledCallRecordingsBeyondHorizon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only open scheduled recordings', async () => {
    queryMock.mockResolvedValue(buildPage([]));

    await findScheduledCallRecordingsBeyondHorizon(CLIENT, NOW);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              status: { eq: 'SCHEDULED' },
              recordingRequestStatus: { eq: 'REQUESTED' },
            },
          }),
        }),
      }),
    );
  });

  it('keeps only recordings whose meeting starts past the horizon', async () => {
    queryMock.mockResolvedValue(
      buildPage([
        {
          id: 'in-horizon',
          externalBotId: 'bot-in-horizon',
          calendarEvent: { startsAt: '2026-07-08T12:00:00.000Z' },
        },
        {
          id: 'at-horizon-boundary',
          externalBotId: 'bot-boundary',
          calendarEvent: { startsAt: '2026-07-11T12:00:00.000Z' },
        },
        {
          id: 'beyond-horizon',
          externalBotId: 'bot-beyond',
          calendarEvent: { startsAt: '2026-07-20T12:00:00.000Z' },
        },
        {
          id: 'no-start',
          externalBotId: 'bot-no-start',
          calendarEvent: { startsAt: null },
        },
      ]),
    );

    const result = await findScheduledCallRecordingsBeyondHorizon(CLIENT, NOW);

    expect(result).toEqual([
      {
        id: 'beyond-horizon',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'bot-beyond',
      },
    ]);
  });

  it('leaves externalBotId undefined when the recording has no bot yet', async () => {
    queryMock.mockResolvedValue(
      buildPage([
        {
          id: 'beyond-horizon-botless',
          externalBotId: null,
          calendarEvent: { startsAt: '2026-08-01T12:00:00.000Z' },
        },
      ]),
    );

    const result = await findScheduledCallRecordingsBeyondHorizon(CLIENT, NOW);

    expect(result).toEqual([
      {
        id: 'beyond-horizon-botless',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: undefined,
      },
    ]);
  });

  it('pages through every result', async () => {
    queryMock
      .mockResolvedValueOnce(
        buildPage(
          [
            {
              id: 'beyond-1',
              calendarEvent: { startsAt: '2026-07-20T12:00:00.000Z' },
            },
          ],
          { hasNextPage: true, endCursor: 'cursor-1' },
        ),
      )
      .mockResolvedValueOnce(
        buildPage([
          {
            id: 'beyond-2',
            calendarEvent: { startsAt: '2026-07-21T12:00:00.000Z' },
          },
        ]),
      );

    const result = await findScheduledCallRecordingsBeyondHorizon(CLIENT, NOW);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0].callRecordings.__args.after).toBe(
      'cursor-1',
    );
    expect(result.map((callRecording) => callRecording.id)).toEqual([
      'beyond-1',
      'beyond-2',
    ]);
  });
});
