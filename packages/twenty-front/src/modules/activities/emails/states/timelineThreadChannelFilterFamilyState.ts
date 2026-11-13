import { type TimelineThreadChannelFilter } from '@/activities/emails/types/TimelineThreadChannelFilter';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const timelineThreadChannelFilterFamilyState = createAtomFamilyState<
  TimelineThreadChannelFilter | null,
  string
>({
  key: 'activities/timelineThreadChannelFilterFamilyState',
  defaultValue: null,
});
