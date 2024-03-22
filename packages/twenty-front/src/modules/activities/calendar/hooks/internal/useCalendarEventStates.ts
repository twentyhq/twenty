import { calendarEventsPageComponentState } from '@/activities/calendar/states/calendaEventsPageComponentState';
import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type useCalendarEventStatesProps = {
  calendarEventScopeId?: string;
};

export const useCalendarEventStates = ({
  calendarEventScopeId,
}: useCalendarEventStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    TabListScopeInternalContext,
    calendarEventScopeId,
  );

  return {
    scopeId,
    calendarEventsPageState: extractComponentState(
      calendarEventsPageComponentState,
      scopeId,
    ),
  };
};
