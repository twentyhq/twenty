import { MessageFindManyPreQueryHook } from 'src/apps/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/apps/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/types/workspace-query-hook.type';
import { CalendarEventFindManyPreQueryHook } from 'src/apps/calendar/query-hooks/calendar-event/calendar-event-find-many.pre-query.hook';
import { CalendarEventFindOnePreQueryHook } from 'src/apps/calendar/query-hooks/calendar-event/calendar-event-find-one.pre-query-hook';

// TODO: move to a decorator
export const workspacePreQueryHooks: WorkspaceQueryHook = {
  message: {
    findOne: [MessageFindOnePreQueryHook.name],
    findMany: [MessageFindManyPreQueryHook.name],
  },
  calendarEvent: {
    findOne: [CalendarEventFindOnePreQueryHook.name],
    findMany: [CalendarEventFindManyPreQueryHook.name],
  },
};
