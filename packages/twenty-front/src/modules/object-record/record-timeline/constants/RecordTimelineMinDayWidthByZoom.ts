import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';

export const RECORD_TIMELINE_MIN_DAY_WIDTH_BY_ZOOM = {
  WEEK: 80,
  MONTH: 28,
  QUARTER: 10,
} as const satisfies Record<RecordTimelineZoom, number>;
