import { selectCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/utils/selectCalendarEventCallRecordingTranscript';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = ({
  id,
  transcript,
  status = CallRecordingStatus.COMPLETED,
}: {
  id: string;
  transcript: unknown;
  status?: CallRecordingStatus;
}) => ({
  __typename: 'CallRecording',
  id,
  status,
  transcript,
  createdAt: '2026-08-01T00:00:00.000Z',
});

const VALID_TRANSCRIPT = [
  {
    participant: { name: 'Ada' },
    words: [{ text: 'Readable transcript' }],
  },
];

describe('selectCalendarEventCallRecordingTranscript', () => {
  it('shows the first readable transcript even when a later attempt failed', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'first-readable',
        transcript: VALID_TRANSCRIPT,
      }),
      createCallRecording({
        id: 'later-failed',
        transcript: { status: 'FAILED' },
        status: CallRecordingStatus.FAILED,
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'READY',
      callRecording: { id: 'first-readable' },
      entries: [{ speakerName: 'Ada', text: 'Readable transcript' }],
    });
  });

  it('shows the first readable transcript when several are readable', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'later-failed',
        transcript: null,
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'first-readable',
        transcript: VALID_TRANSCRIPT,
      }),
      createCallRecording({
        id: 'second-readable',
        transcript: [
          {
            participant: { name: 'Grace' },
            words: [{ text: 'Second transcript' }],
          },
        ],
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'READY',
      callRecording: { id: 'first-readable' },
    });
  });

  it('prefers a pending candidate over earlier terminal candidates', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'first-failed',
        transcript: { status: 'FAILED' },
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'retry-pending',
        transcript: null,
        status: CallRecordingStatus.PROCESSING,
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'PENDING',
      callRecording: { id: 'retry-pending' },
    });
  });

  it('falls back to the first recording when nothing is readable or pending', () => {
    const selection = selectCalendarEventCallRecordingTranscript([
      createCallRecording({
        id: 'first-failed',
        transcript: { status: 'FAILED' },
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'later-empty',
        transcript: [],
      }),
    ]);

    expect(selection).toMatchObject({
      state: 'FAILED',
      callRecording: { id: 'first-failed' },
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
          status: CallRecordingStatus.FAILED,
        }),
      ]),
    ).toMatchObject({ state: 'READY' });
  });

  it('returns no recording for an empty candidate list', () => {
    expect(selectCalendarEventCallRecordingTranscript([])).toEqual({
      state: 'NO_RECORDING',
    });
  });
});
