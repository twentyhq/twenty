import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';

import { WORKSPACE_MEMBER_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/workspace-member-reconciliation-logic-function-universal-identifier';
import { findUpcomingCalendarEventIdsForWorkspaceMember } from 'src/logic-functions/data/find-upcoming-calendar-event-ids-for-workspace-member.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileRecallRecordingBotForCalendarEventIds } from 'src/logic-functions/flows/reconcile-recall-recording-bot.util';

const WORKSPACE_MEMBER_OBJECT_NAME = 'workspaceMember';

const RECALL_RECORDING_BOT_RELEVANT_WORKSPACE_MEMBER_FIELDS = [
  'meetingBotAutoRecordEnabled',
];

type WorkspaceMemberForDatabaseEvent = {
  id: string;
};

type WorkspaceMemberDatabaseEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<WorkspaceMemberForDatabaseEvent>
>;

export const reconcileRecallRecordingBotWorkspaceMemberHandler = async (
  event: WorkspaceMemberDatabaseEvent,
): Promise<object | undefined> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== WORKSPACE_MEMBER_OBJECT_NAME) {
    return { skipped: true, reason: 'not a workspace member' };
  }

  if (!isRelevantWorkspaceMemberChange({ event, action })) {
    return { skipped: true, reason: 'no relevant workspace member change' };
  }

  const workspaceMemberId = getUniqueSortedIds([
    event.recordId,
    event.properties.before?.id,
    event.properties.after?.id,
  ])[0];

  if (isUndefined(workspaceMemberId)) {
    return { skipped: true, reason: 'missing workspace member id' };
  }

  const now = new Date();
  const client = new CoreApiClient();
  const calendarEventIds = await findUpcomingCalendarEventIdsForWorkspaceMember(
    {
      client,
      workspaceMemberId,
      now,
    },
  );

  if (calendarEventIds.length === 0) {
    return { skipped: true, reason: 'no upcoming calendar events' };
  }

  const reconciliationResults =
    await reconcileRecallRecordingBotForCalendarEventIds({
      client,
      calendarEventIds,
      now,
    });

  return {
    reconciled: true,
    workspaceMemberId,
    calendarEventIds,
    reconciliationResults,
  };
};

const isRelevantWorkspaceMemberChange = ({
  event,
  action,
}: {
  event: WorkspaceMemberDatabaseEvent;
  action: string | undefined;
}): boolean => {
  if (action === 'updated') {
    const updatedFields = event.properties.updatedFields ?? [];

    return updatedFields.some((updatedField) =>
      RECALL_RECORDING_BOT_RELEVANT_WORKSPACE_MEMBER_FIELDS.includes(
        updatedField,
      ),
    );
  }

  // A removed member no longer contributes auto-record intent to meetings.
  return action === 'deleted' || action === 'destroyed';
};

export default defineLogicFunction({
  universalIdentifier:
    WORKSPACE_MEMBER_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-recall-recording-bot-workspace-member',
  description:
    'Reconciles app-managed Recall bot recording requests when a workspace member auto-record setting changes or the member is deleted.',
  timeoutSeconds: 60,
  handler: reconcileRecallRecordingBotWorkspaceMemberHandler,
  databaseEventTriggerSettings: {
    eventName: `${WORKSPACE_MEMBER_OBJECT_NAME}.*`,
  },
});
