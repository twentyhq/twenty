import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { Temporal } from 'temporal-polyfill';

export const recordCalendarSelectedDateComponentState =
  createAtomComponentState<Temporal.PlainDate>({
    key: 'recordCalendarSelectedDateComponentState',
    defaultValue: Temporal.Now.plainDateISO(),
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
