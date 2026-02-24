import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordCalendarRecordIdsComponentState = createComponentStateV2<
  string[]
>({
  key: 'recordCalendarRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordCalendarComponentInstanceContext,
});
