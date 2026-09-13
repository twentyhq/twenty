import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_OBJECT_NAME } from 'src/logic-functions/constants/slack-assistant-request-object-name';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { slackAssistantWorkerHandler } from 'src/logic-functions/handlers/slack-assistant-worker-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';

type SlackAssistantRequestCreatedEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SlackAssistantRequestRecord>
>;

// Compatibility drain for one release: requests recorded before the upgrade
// are still answered through this trigger, while requests recorded after it
// are answered inline by slack-assistant-request and lose the claim here.
export const slackAssistantWorkerDrainHandler = async (
  event: SlackAssistantRequestCreatedEvent,
): Promise<object> => await slackAssistantWorkerHandler(event.properties.after);

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-worker',
  description:
    'Answers Slack Assistant Requests recorded before the app upgrade that moved answering into slack-assistant-request. Kept for one release so queued requests are drained; requests recorded after the upgrade are already claimed and skipped here.',
  timeoutSeconds: SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: slackAssistantWorkerDrainHandler,
  databaseEventTriggerSettings: {
    eventName: `${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}.created`,
  },
});
