import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const recordIndexCalendarLayoutState =
  createAtomState<ViewCalendarLayout>({
    key: 'recordIndexCalendarLayoutState',
    defaultValue: ViewCalendarLayout.MONTH,
  });
