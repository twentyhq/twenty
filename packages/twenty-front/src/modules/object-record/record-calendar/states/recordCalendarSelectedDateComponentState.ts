import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { Temporal } from 'temporal-polyfill';

export const recordCalendarSelectedDateComponentState =
  createComponentState<Temporal.PlainDate>({
    key: 'recordCalendarSelectedDateComponentState',
    defaultValue: Temporal.Now.plainDateISO(),
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
