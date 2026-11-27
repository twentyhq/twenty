import { isUndefined } from '@sniptt/guards';

import { type CalendarChannelOwner } from 'src/logic-functions/types/calendar-channel-owner.type';
import { type MemberApplicationVariables } from 'src/logic-functions/types/member-application-variables.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const getCalendarOwnerWorkspaceMemberIds = ({
  calendarChannelIds,
  calendarChannelOwnerByCalendarChannelId,
  memberApplicationVariables,
}: {
  calendarChannelIds: string[];
  calendarChannelOwnerByCalendarChannelId: Map<string, CalendarChannelOwner>;
  memberApplicationVariables: Pick<
    MemberApplicationVariables,
    'userWorkspaceId' | 'workspaceMemberId'
  >[];
}): string[] => {
  const workspaceMemberIdByUserWorkspaceId = new Map(
    memberApplicationVariables.map(({ userWorkspaceId, workspaceMemberId }) => [
      userWorkspaceId,
      workspaceMemberId,
    ]),
  );

  return getUniqueSortedIds(
    calendarChannelIds.map((calendarChannelId) => {
      const calendarChannelOwner =
        calendarChannelOwnerByCalendarChannelId.get(calendarChannelId);

      return isUndefined(calendarChannelOwner)
        ? undefined
        : workspaceMemberIdByUserWorkspaceId.get(
            calendarChannelOwner.userWorkspaceId,
          );
    }),
  );
};
