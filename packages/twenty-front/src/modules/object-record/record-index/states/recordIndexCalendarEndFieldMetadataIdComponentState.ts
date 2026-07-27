import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexCalendarEndFieldMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordIndexCalendarEndFieldMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
