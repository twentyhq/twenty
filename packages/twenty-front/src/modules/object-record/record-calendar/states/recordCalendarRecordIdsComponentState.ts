import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordCalendarRecordIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'recordCalendarRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordCalendarComponentInstanceContext,
});
