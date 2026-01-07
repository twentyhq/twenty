import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasInitializedRecordCalendarSelectedDateComponentState =
  createComponentState<boolean>({
    key: 'hasInitializedRecordCalendarSelectedDateComponentState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
