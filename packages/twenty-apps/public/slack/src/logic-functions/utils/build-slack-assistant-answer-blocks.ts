import {
  type ContextBlock,
  type KnownBlock,
  type MrkdwnElement,
} from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { SLACK_ASSISTANT_RECORD_LINK_CHIP_SEPARATOR } from 'src/logic-functions/constants/slack-assistant-record-links';
import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { type TwentyRecordLink } from 'src/logic-functions/types/twenty-record-link.type';
import { extractTwentyRecordLinks } from 'src/logic-functions/utils/extract-twenty-record-links';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

const TRUNCATION_SUFFIX = '…';

const truncateForMarkdownBlock = (text: string): string =>
  text.length <= SLACK_MARKDOWN_BLOCK_MAX_LENGTH
    ? text
    : `${text.slice(0, SLACK_MARKDOWN_BLOCK_MAX_LENGTH - TRUNCATION_SUFFIX.length)}${TRUNCATION_SUFFIX}`;

// Context blocks render legacy mrkdwn, where links are <url|label> rather than [label](url)
const buildRecordLinkChipsElement = (
  recordLinks: TwentyRecordLink[],
): MrkdwnElement => ({
  type: 'mrkdwn',
  text: recordLinks
    .map(({ label, url }) => `<${url}|${label}>`)
    .join(SLACK_ASSISTANT_RECORD_LINK_CHIP_SEPARATOR),
});

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
  workspaceBaseUrl,
}: {
  responseText: string;
  durationMilliseconds: number;
  workspaceBaseUrl: string | undefined;
}): KnownBlock[] => {
  const recordLinks = extractTwentyRecordLinks({
    text: responseText,
    workspaceBaseUrl,
  });

  const footerElements: MrkdwnElement[] = [
    ...(isNonEmptyArray(recordLinks)
      ? [buildRecordLinkChipsElement(recordLinks)]
      : []),
    {
      type: 'mrkdwn',
      text: `Answered in ${formatSlackAssistantDuration(durationMilliseconds)}`,
    },
  ];

  const footerBlock: ContextBlock = {
    type: 'context',
    elements: footerElements,
  };

  return [
    { type: 'markdown', text: truncateForMarkdownBlock(responseText) },
    footerBlock,
  ];
};
