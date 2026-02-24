import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const hasInitializedRecordCalendarSelectedDateComponentState =
  createComponentStateV2<boolean>({
    key: 'hasInitializedRecordCalendarSelectedDateComponentState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
