import { type CalendarEventComposerInitialValues } from '@/activities/calendar/types/CalendarEventComposerInitialValues';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeCalendarEventInitialValuesComponentState =
  createAtomComponentState<CalendarEventComposerInitialValues | null>({
    key: 'side-panel/compose-calendar-event-initial-values',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
