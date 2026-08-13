import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Slack HTML-escapes URLs in link_shared payloads
const decodeSlackLinkUrl = (url: string): string =>
  url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export const parseSlackRecordLink = ({
  linkUrl,
  workspaceBaseUrl,
}: {
  linkUrl: string;
  workspaceBaseUrl: string;
}): SlackRecordLink | undefined => {
  let parsedLinkUrl: URL;
  let parsedBaseUrl: URL;

  try {
    parsedLinkUrl = new URL(decodeSlackLinkUrl(linkUrl));
    parsedBaseUrl = new URL(workspaceBaseUrl);
  } catch {
    return undefined;
  }

  if (parsedLinkUrl.origin !== parsedBaseUrl.origin) {
    return undefined;
  }

  const pathSegments = parsedLinkUrl.pathname
    .split('/')
    .filter(isNonEmptyString);

  if (pathSegments.length !== 3 || pathSegments[0] !== 'object') {
    return undefined;
  }

  const [, objectNameSingular, recordId] = pathSegments;

  if (!UUID_PATTERN.test(recordId)) {
    return undefined;
  }

  return { linkUrl, objectNameSingular, recordId };
};
