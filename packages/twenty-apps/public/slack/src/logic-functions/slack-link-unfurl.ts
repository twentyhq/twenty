import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_LINK_UNFURL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { unfurlSlackRecordLinks } from 'src/logic-functions/utils/unfurl-slack-record-links';

export default defineLogicFunction({
  universalIdentifier: SLACK_LINK_UNFURL_UNIVERSAL_IDENTIFIER,
  name: 'slack-link-unfurl',
  description:
    'Runs in the resolved workspace: renders Twenty record links shared in Slack as work object previews, when the poster maps to a workspace member.',
  timeoutSeconds: 15,
  handler: unfurlSlackRecordLinks,
});
