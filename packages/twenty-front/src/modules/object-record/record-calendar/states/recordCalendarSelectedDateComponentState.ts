import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { Temporal } from 'temporal-polyfill';

export const recordCalendarSelectedDateComponentState =
  createComponentStateV2<Temporal.PlainDate>({
    key: 'recordCalendarSelectedDateComponentState',
    defaultValue: Temporal.Now.plainDateISO(),
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
