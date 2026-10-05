import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';

export const getGranolaNoteTimeRange = (
  note: Pick<GranolaNote, 'calendar_event' | 'transcript' | 'created_at'>,
): { startedAt: string; endedAt: string } => {
  const startedAt =
    note.transcript?.[0]?.start_time ??
    note.calendar_event?.scheduled_start_time ??
    note.created_at;

  return {
    startedAt,
    endedAt:
      note.transcript?.[note.transcript.length - 1]?.end_time ??
      note.calendar_event?.scheduled_end_time ??
      startedAt,
  };
};
