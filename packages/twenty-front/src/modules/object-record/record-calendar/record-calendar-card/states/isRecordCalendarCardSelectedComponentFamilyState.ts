import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';

export const isRecordCalendarCardSelectedComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'isRecordCalendarCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
