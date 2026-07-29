import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_MAX_RECORD_LINK_CHIPS } from 'src/logic-functions/constants/slack-assistant-record-links';
import { type TwentyRecordLink } from 'src/logic-functions/types/twenty-record-link.type';

const MARKDOWN_LINK_PATTERN = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
const MARKDOWN_EMPHASIS_PATTERN = /[*_`~]/g;

export const extractTwentyRecordLinks = ({
  text,
  workspaceBaseUrl,
  maxLinks = SLACK_ASSISTANT_MAX_RECORD_LINK_CHIPS,
}: {
  text: string;
  workspaceBaseUrl: string | undefined;
  maxLinks?: number;
}): TwentyRecordLink[] => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return [];
  }

  const recordUrlPrefix = `${workspaceBaseUrl}/object/`;
  const seenUrls = new Set<string>();
  const recordLinks: TwentyRecordLink[] = [];

  for (const [, rawLabel, url] of text.matchAll(MARKDOWN_LINK_PATTERN)) {
    if (!url.startsWith(recordUrlPrefix) || seenUrls.has(url)) {
      continue;
    }

    const label = rawLabel.replace(MARKDOWN_EMPHASIS_PATTERN, '').trim();

    if (!isNonEmptyString(label)) {
      continue;
    }

    seenUrls.add(url);
    recordLinks.push({ label, url });

    if (recordLinks.length >= maxLinks) {
      break;
    }
  }

  return recordLinks;
};
