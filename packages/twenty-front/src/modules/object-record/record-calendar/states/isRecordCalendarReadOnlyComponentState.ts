import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// A fully read-only calendar: no card drag, no per-day record creation,
// no layout switching — dashboard widgets render calendars as pure
// projections. Unlike the board's view-settings flag
// (isRecordBoardViewSettingsReadOnlyComponentState, which keeps record
// data editable), this one disables data interactions too, which is why
// it keeps the plain "read-only" name.
export const isRecordCalendarReadOnlyComponentState =
  createAtomComponentState<boolean>({
    key: 'isRecordCalendarReadOnlyComponentState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
