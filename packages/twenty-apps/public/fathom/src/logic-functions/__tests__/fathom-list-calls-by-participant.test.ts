import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { buildLogicFunctionExecutionContext } from 'src/__tests__/utils/logic-function-execution-context.util';

const mocks = vi.hoisted(() => ({
  listFathomConnectionsForRequest: vi.fn(),
  listMeetings: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  jsonSchemaToInputSchema: () => [],
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = mocks.listMeetings;
  },
}));

vi.mock(
  'src/logic-functions/utils/list-fathom-connections-for-request.util',
  () => ({
    listFathomConnectionsForRequest: mocks.listFathomConnectionsForRequest,
  }),
);

const { fathomListCallsByParticipantHandler } =
  await import('src/logic-functions/fathom-list-calls-by-participant');

const CONTEXT = buildLogicFunctionExecutionContext('user-workspace-1');

const buildMeetingWith = (recordingId: number, startedAt: string) =>
  buildFathomMeeting({
    recordingId,
    inviteeEmails: ['Ada@Example.com', 'owner@example.com'],
    recordingStartTime: startedAt,
  });

describe('fathomListCallsByParticipantHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listFathomConnectionsForRequest.mockResolvedValue([
      { id: 'connection-1', accessToken: 'token' },
    ]);
  });

  it.each([undefined, '   ', 42])(
    'rejects a participantEmail of %s',
    async (participantEmail) => {
      expect(
        await fathomListCallsByParticipantHandler(
          { participantEmail },
          CONTEXT,
        ),
      ).toEqual({ success: false, error: 'participantEmail is required' });
      expect(mocks.listFathomConnectionsForRequest).not.toHaveBeenCalled();
    },
  );

  it('reports a missing connection', async () => {
    mocks.listFathomConnectionsForRequest.mockResolvedValue([]);

    expect(
      await fathomListCallsByParticipantHandler(
        { participantEmail: 'ada@example.com' },
        CONTEXT,
      ),
    ).toEqual({
      success: false,
      error: expect.stringContaining('not connected'),
    });
  });

  it('returns the calls whose invitees include the email, most recent first', async () => {
    mocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([
        [
          buildMeetingWith(1, '2026-08-18T10:00:00.000Z'),
          buildFathomMeeting({
            recordingId: 2,
            inviteeEmails: ['someone@example.com'],
          }),
          buildMeetingWith(3, '2026-08-21T10:00:00.000Z'),
        ],
      ]),
    );

    expect(
      await fathomListCallsByParticipantHandler(
        { participantEmail: ' ADA@example.com ' },
        CONTEXT,
      ),
    ).toEqual({
      success: true,
      count: 2,
      calls: [
        {
          recordingId: 3,
          title: 'Meeting 3',
          startedAt: '2026-08-21T10:00:00.000Z',
          durationMinutes: 30,
          participants: ['Ada@Example.com', 'owner@example.com'],
          recordedBy: 'owner@example.com',
          fathomUrl: 'https://fathom.video/calls/3',
          meetingUrl: 'https://meet.example.com/customer-call',
        },
        expect.objectContaining({ recordingId: 1 }),
      ],
    });
  });

  it('stops paging once the limit is reached and caps the result', async () => {
    mocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([
        [
          buildMeetingWith(1, '2026-08-18T10:00:00.000Z'),
          buildMeetingWith(2, '2026-08-19T10:00:00.000Z'),
        ],
        [buildMeetingWith(3, '2026-08-20T10:00:00.000Z')],
      ]),
    );

    const result = await fathomListCallsByParticipantHandler(
      { participantEmail: 'ada@example.com', limit: 1 },
      CONTEXT,
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        count: 1,
        calls: [expect.objectContaining({ recordingId: 2 })],
      }),
    );
    expect(mocks.listMeetings).toHaveBeenCalledTimes(1);
  });

  it('merges the calls seen by several connected accounts without duplicates', async () => {
    mocks.listFathomConnectionsForRequest.mockResolvedValue([
      { id: 'connection-1', accessToken: 'token-1' },
      { id: 'connection-2', accessToken: 'token-2' },
    ]);
    mocks.listMeetings
      .mockImplementationOnce(
        buildFathomMeetingPages([
          [buildMeetingWith(1, '2026-08-18T10:00:00.000Z')],
        ]),
      )
      .mockImplementationOnce(
        buildFathomMeetingPages([
          [
            buildMeetingWith(1, '2026-08-18T10:00:00.000Z'),
            buildMeetingWith(2, '2026-08-19T10:00:00.000Z'),
          ],
        ]),
      );

    expect(
      await fathomListCallsByParticipantHandler(
        { participantEmail: 'ada@example.com' },
        buildLogicFunctionExecutionContext(null),
      ),
    ).toEqual(
      expect.objectContaining({
        count: 2,
        calls: [
          expect.objectContaining({ recordingId: 2 }),
          expect.objectContaining({ recordingId: 1 }),
        ],
      }),
    );
  });
});
