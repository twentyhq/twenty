import { selectCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/utils/selectCalendarEventCallRecording';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = ({
  id,
  status,
}: {
  id: string;
  status: CallRecordingStatus;
}) => ({
  __typename: 'CallRecording' as const,
  id,
  status,
  transcript: null,
  summary: null,
  video: null,
  createdAt: '2026-08-01T00:00:00.000Z',
});

describe('selectCalendarEventCallRecording', () => {
  it('selects the first completed recording over earlier in-progress ones', () => {
    const selected = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'in-progress',
        status: CallRecordingStatus.PROCESSING,
      }),
      createCallRecording({
        id: 'completed',
        status: CallRecordingStatus.COMPLETED,
      }),
    ]);

    expect(selected?.id).toBe('completed');
  });

  it('selects the earliest created recording when several are completed', () => {
    const selected = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'first-completed',
        status: CallRecordingStatus.COMPLETED,
      }),
      createCallRecording({
        id: 'second-completed',
        status: CallRecordingStatus.COMPLETED,
      }),
    ]);

    expect(selected?.id).toBe('first-completed');
  });

  it('falls back to the first in-progress recording when none is completed', () => {
    const selected = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'failed',
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'scheduled',
        status: CallRecordingStatus.SCHEDULED,
      }),
      createCallRecording({
        id: 'processing',
        status: CallRecordingStatus.PROCESSING,
      }),
    ]);

    expect(selected?.id).toBe('scheduled');
  });

  it('falls back to the first recording when all are terminal', () => {
    const selected = selectCalendarEventCallRecording([
      createCallRecording({
        id: 'failed',
        status: CallRecordingStatus.FAILED,
      }),
      createCallRecording({
        id: 'not-recorded',
        status: CallRecordingStatus.NOT_RECORDED,
      }),
    ]);

    expect(selected?.id).toBe('failed');
  });

  it('returns undefined for an empty candidate list', () => {
    expect(selectCalendarEventCallRecording([])).toBeUndefined();
  });
});
