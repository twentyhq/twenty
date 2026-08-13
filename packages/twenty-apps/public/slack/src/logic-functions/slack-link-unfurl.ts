import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_LINK_UNFURL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

export default defineLogicFunction({
  universalIdentifier: SLACK_LINK_UNFURL_UNIVERSAL_IDENTIFIER,
  name: 'slack-link-unfurl',
  description:
    'Runs in the resolved workspace: expands Twenty record links shared in Slack into compact record cards via chat.unfurl. Unresolvable or inaccessible records are skipped silently.',
  timeoutSeconds: 15,
  handler: unfurlSlackRecordLinks,
});
