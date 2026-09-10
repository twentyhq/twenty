import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ENTITY_DETAILS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { presentSlackRecordDetails } from 'src/logic-functions/utils/present-slack-record-details';

export default defineLogicFunction({
  universalIdentifier: SLACK_ENTITY_DETAILS_UNIVERSAL_IDENTIFIER,
  name: 'slack-entity-details',
  description:
    "Runs in the resolved workspace: answers Slack's entity_details_requested with the record's work object metadata, filling the flexpane a user opens from a record link preview.",
  timeoutSeconds: 15,
  handler: presentSlackRecordDetails,
});
