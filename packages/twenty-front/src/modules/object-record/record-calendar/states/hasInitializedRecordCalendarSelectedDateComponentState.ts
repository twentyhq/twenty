import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const hasInitializedRecordCalendarSelectedDateComponentState =
  createAtomComponentState<boolean>({
    key: 'hasInitializedRecordCalendarSelectedDateComponentState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
