import { MessageFindManyPreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-many.pre-query.hook';
import { MessageFindOnePreQueryHook } from 'src/modules/messaging/query-hooks/message/message-find-one.pre-query-hook';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/types/workspace-query-hook.type';
import { CalendarEventFindManyPreQueryHook } from 'src/modules/calendar/query-hooks/calendar-event/calendar-event-find-many.pre-query.hook';
import { CalendarEventFindOnePreQueryHook } from 'src/modules/calendar/query-hooks/calendar-event/calendar-event-find-one.pre-query-hook';
import { BlocklistCreateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-create-many.pre-query.hook';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/connected-account/query-hooks/blocklist/blocklist-update-one.pre-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';
import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';

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
  blocklist: {
    createMany: [BlocklistCreateManyPreQueryHook.name],
    updateMany: [BlocklistUpdateManyPreQueryHook.name],
    updateOne: [BlocklistUpdateOnePreQueryHook.name],
  },
  workspaceMember: {
    deleteOne: [WorkspaceMemberDeleteOnePreQueryHook.name],
    deleteMany: [WorkspaceMemberDeleteManyPreQueryHook.name],
  },
};
