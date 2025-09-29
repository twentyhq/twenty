import { createState } from 'twenty-ui/utilities';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const recordIndexCalendarLayoutState = createState<ViewCalendarLayout>({
  key: 'recordIndexCalendarLayoutState',
  defaultValue: ViewCalendarLayout.MONTH,
});
