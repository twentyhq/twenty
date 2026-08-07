import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = ({
  id,
  transcript,
  endedAt,
  startedAt = null,
  createdAt = '2026-08-01T00:00:00.000Z',
  status = CallRecordingStatus.COMPLETED,
}: {
  id: string;
  transcript: unknown;
  endedAt: string | null;
  startedAt?: string | null;
  createdAt?: string;
  status?: CallRecordingStatus;
}) => ({
  __typename: 'CallRecording',
  id,
  status,
  transcript,
  startedAt,
  endedAt,
  createdAt,
});

const VALID_TRANSCRIPT = [
  {
    participant: { name: 'Ada' },
    words: [{ text: 'Readable transcript' }],
  },
];

describe('selectCalendarEventCallRecordingTranscript', () => {
  it('keeps an older readable transcript when a newer attempt failed', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'older-readable',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-01T10:00:00.000Z',
      }),
      createCallRecording({
        id: 'newer-failed',
        transcript: { status: 'FAILED' },
        endedAt: '2026-08-02T10:00:00.000Z',
        status: CallRecordingStatus.FAILED,
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'READY',
      callRecording: { id: 'older-readable' },
      entries: [{ speakerName: 'Ada', text: 'Readable transcript' }],
    });
  });

  it('selects the newest readable transcript among readable candidates', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'older-readable',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-01T10:00:00.000Z',
      }),
      createCallRecording({
        id: 'newer-readable',
        transcript: [
          {
            participant: { name: 'Grace' },
            words: [{ text: 'Newer transcript' }],
          },
        ],
        endedAt: '2026-08-02T10:00:00.000Z',
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'READY',
      callRecording: { id: 'newer-readable' },
    });
  });

  it('selects the newest pending candidate before terminal candidates', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'older-pending',
        transcript: { status: 'PENDING' },
        endedAt: '2026-08-01T10:00:00.000Z',
      }),
      createCallRecording({
        id: 'newer-pending',
        transcript: null,
        endedAt: '2026-08-02T10:00:00.000Z',
        status: CallRecordingStatus.PROCESSING,
      }),
      createCallRecording({
        id: 'newest-failed',
        transcript: { status: 'FAILED' },
        endedAt: '2026-08-03T10:00:00.000Z',
        status: CallRecordingStatus.FAILED,
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'PENDING',
      callRecording: { id: 'newer-pending' },
    });
  });

  it.each([
    {
      expectedState: 'PENDING',
      transcript: { status: 'PENDING' },
      status: CallRecordingStatus.COMPLETED,
    },
    {
      expectedState: 'FAILED',
      transcript: { status: 'FAILED' },
      status: CallRecordingStatus.COMPLETED,
    },
    {
      expectedState: 'FAILED',
      transcript: null,
      status: CallRecordingStatus.NOT_RECORDED,
    },
    {
      expectedState: 'EMPTY',
      transcript: [],
      status: CallRecordingStatus.COMPLETED,
    },
    {
      expectedState: 'UNRECOGNIZED',
      transcript: { status: 'UNKNOWN' },
      status: CallRecordingStatus.COMPLETED,
    },
    {
      expectedState: 'MISSING',
      transcript: null,
      status: CallRecordingStatus.COMPLETED,
    },
  ] as const)(
    'returns $expectedState for its corresponding terminal payload',
    ({ expectedState, transcript, status }) => {
      expect(
        selectCalendarEventCallRecordingTranscript([
          createCallRecording({
            id: 'recording',
            transcript,
            endedAt: '2026-08-01T10:00:00.000Z',
            status,
          }),
        ]),
      ).toMatchObject({ state: expectedState });
    },
  );

  it.each([
    {
      expectedState: 'PENDING',
      transcript: [],
      status: CallRecordingStatus.PROCESSING,
    },
    {
      expectedState: 'PENDING',
      transcript: { unexpected: true },
      status: CallRecordingStatus.RECORDING,
    },
    {
      expectedState: 'FAILED',
      transcript: [],
      status: CallRecordingStatus.FAILED,
    },
    {
      expectedState: 'FAILED',
      transcript: { unexpected: true },
      status: CallRecordingStatus.NOT_RECORDED,
    },
    {
      expectedState: 'FAILED',
      transcript: { status: 'PENDING' },
      status: CallRecordingStatus.FAILED,
    },
    {
      expectedState: 'FAILED',
      transcript: { status: 'FAILED' },
      status: CallRecordingStatus.PROCESSING,
    },
  ] as const)(
    'uses lifecycle and explicit failure precedence for $status with $transcript',
    ({ expectedState, transcript, status }) => {
      expect(
        selectCalendarEventCallRecordingTranscript([
          createCallRecording({
            id: 'recording',
            transcript,
            endedAt: '2026-08-01T10:00:00.000Z',
            status,
          }),
        ]),
      ).toMatchObject({ state: expectedState });
    },
  );

  it('lets a readable transcript override a failed lifecycle status', () => {
    expect(
      selectCalendarEventCallRecordingTranscript([
        createCallRecording({
          id: 'recording',
          transcript: VALID_TRANSCRIPT,
          endedAt: '2026-08-01T10:00:00.000Z',
          status: CallRecordingStatus.FAILED,
        }),
      ]),
    ).toMatchObject({ state: 'READY' });
  });

  it('falls back from ended time to started time and then creation time', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'created-time-only',
        transcript: VALID_TRANSCRIPT,
        endedAt: null,
        createdAt: '2026-08-01T12:00:00.000Z',
      }),
      createCallRecording({
        id: 'started-time',
        transcript: VALID_TRANSCRIPT,
        endedAt: 'not-a-date',
        startedAt: '2026-08-02T12:00:00.000Z',
        createdAt: '2026-08-01T10:00:00.000Z',
      }),
    ]);

    expect(selection).toMatchObject({
      callRecording: { id: 'started-time' },
    });
  });

  it('uses creation time and then id as deterministic tie-breakers', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'recording-b',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-01T12:00:00.000Z',
        createdAt: '2026-08-01T11:00:00.000Z',
      }),
      createCallRecording({
        id: 'recording-a',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-01T12:00:00.000Z',
        createdAt: '2026-08-01T11:00:00.000Z',
      }),
    ]);

    expect(selection).toMatchObject({
      callRecording: { id: 'recording-a' },
    });
  });

  it('uses id as a deterministic tie-breaker when every timestamp is invalid', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'recording-b',
        transcript: VALID_TRANSCRIPT,
        endedAt: 'not-a-date',
        startedAt: null,
        createdAt: 'also-not-a-date',
      }),
      createCallRecording({
        id: 'recording-a',
        transcript: VALID_TRANSCRIPT,
        endedAt: null,
        startedAt: 'not-a-date',
        createdAt: 'also-not-a-date',
      }),
    ]);

    expect(selection).toMatchObject({
      callRecording: { id: 'recording-a' },
    });
  });

  it('returns no recording without mutating the candidate order', () => {
    expect(selectCalendarEventCallRecordingTranscript([])).toEqual({
      state: 'NO_RECORDING',
    });

    const callRecordings = [
      createCallRecording({
        id: 'older',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-01T10:00:00.000Z',
      }),
      createCallRecording({
        id: 'newer',
        transcript: VALID_TRANSCRIPT,
        endedAt: '2026-08-02T10:00:00.000Z',
      }),
    ];

    selectCalendarEventCallRecordingTranscript(callRecordings);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'older',
      'newer',
    ]);
  });
});
