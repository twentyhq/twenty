import { selectCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/utils/selectCalendarEventCallRecording';
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
  __typename: 'CallRecording' as const,
  id,
  status,
  transcript,
  summary: null,
  createdAt: '2026-08-01T00:00:00.000Z',
});

const VALID_TRANSCRIPT = [
  {
    participant: { name: 'Ada' },
    words: [{ text: 'Readable transcript', start_timestamp: { relative: 0 } }],
  },
];

describe('selectCalendarEventCallRecording', () => {
  it('selects the first readable transcript even when a later attempt failed', () => {
    const selection = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'first-readable',
        transcript: VALID_TRANSCRIPT,
      }),
      createCallRecording({
        id: 'later-failed',
        transcript: null,
        status: CallRecordingStatus.FAILED,
      }),
    ]);

    expect(selection?.callRecording.id).toBe('first-readable');
    expect(selection?.transcriptEntries).toEqual([
      expect.objectContaining({
        speakerName: 'Ada',
        text: 'Readable transcript',
      }),
    ]);
  });

  it('selects the first readable transcript when several are readable', () => {
    const selection = selectCalendarEventCallRecording([
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
            words: [{ text: 'Later', start_timestamp: { relative: 0 } }],
          },
        ],
      }),
    ]);

    expect(selection?.callRecording.id).toBe('first-readable');
  });

  it('prefers a pending candidate over earlier terminal candidates', () => {
    const selection = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'first-failed',
        transcript: { status: 'FAILED' },
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'retry-pending',
        transcript: { status: 'PENDING' },
        status: CallRecordingStatus.PROCESSING,
      }),
    ]);

    expect(selection?.callRecording.id).toBe('retry-pending');
    expect(selection?.transcriptEntries).toBeUndefined();
  });

  it('falls back to the first recording when nothing is readable or pending', () => {
    const selection = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'first-failed',
        transcript: { status: 'FAILED' },
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'second-failed',
        transcript: null,
        status: CallRecordingStatus.NOT_RECORDED,
      }),
    ]);

    expect(selection?.callRecording.id).toBe('first-failed');
    expect(selection?.transcriptEntries).toBeUndefined();
  });

  it('returns no entries for an empty or unreadable transcript payload', () => {
    const selection = selectCalendarEventCallRecording([
      createCallRecording({ id: 'empty-transcript', transcript: [] }),
    ]);

    expect(selection?.callRecording.id).toBe('empty-transcript');
    expect(selection?.transcriptEntries).toBeUndefined();
  });

  it('lets a readable transcript override a failed lifecycle status', () => {
    const selection = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'recording',
        transcript: VALID_TRANSCRIPT,
        status: CallRecordingStatus.FAILED,
      }),
    ]);

    expect(selection?.transcriptEntries).toHaveLength(1);
  });

  it('returns undefined for an empty candidate list', () => {
    expect(selectCalendarEventCallRecording([])).toBeUndefined();
  });
});
