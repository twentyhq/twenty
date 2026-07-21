import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const recordIndexCalendarLayoutComponentState =
  createAtomComponentState<ViewCalendarLayout>({
    key: 'recordIndexCalendarLayoutComponentState',
    defaultValue: ViewCalendarLayout.MONTH,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
