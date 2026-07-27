import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexCalendarFieldMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'recordIndexCalendarFieldMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
