import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';

export const isRecordCalendarCardSelectedComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'isRecordCalendarCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
