import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';
import { type Temporal } from 'temporal-polyfill';

export const shiftRecordTimelineAnchorDate = ({
  anchorDate,
  zoom,
  direction,
}: {
  anchorDate: Temporal.PlainDate;
  zoom: RecordTimelineZoom;
  direction: 1 | -1;
}): Temporal.PlainDate => {
  switch (zoom) {
    case 'WEEK':
      return anchorDate.add({ weeks: direction });
    case 'MONTH':
      return anchorDate.add({ months: direction });
    case 'QUARTER':
      return anchorDate.add({ months: 3 * direction });
  }
};
