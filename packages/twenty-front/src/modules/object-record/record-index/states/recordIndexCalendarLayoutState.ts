import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const recordIndexCalendarLayoutState = createStateV2<ViewCalendarLayout>(
  {
    key: 'recordIndexCalendarLayoutState',
    defaultValue: ViewCalendarLayout.MONTH,
  },
);
