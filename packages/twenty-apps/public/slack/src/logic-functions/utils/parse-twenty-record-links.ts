import { isDefined } from 'twenty-sdk/utils';

import { SLACK_UNFURL_OBJECT_NAMES } from 'src/logic-functions/constants/slack-unfurl-object-names';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isSupportedObjectName = (
  value: string,
): value is SlackRecordLink['objectNameSingular'] =>
  SLACK_UNFURL_OBJECT_NAMES.some((objectName) => objectName === value);

const parseRecordLink = ({
  workspaceBaseUrl,
  url,
}: {
  workspaceBaseUrl: string;
  url: string;
}): SlackRecordLink | undefined => {
  const normalizedUrl = url.replace(/&amp;/g, '&');

  if (!normalizedUrl.startsWith(`${workspaceBaseUrl}/`)) {
    return undefined;
  }

  const path = normalizedUrl.slice(workspaceBaseUrl.length);
  const match = path.match(/^\/object\/([^/]+)\/([^/?#]+)\/?(?:[?#]|$)/);

  if (!match) {
    return undefined;
  }

  const [, objectNameSingular, recordId] = match;

  if (
    !isSupportedObjectName(objectNameSingular) ||
    !UUID_PATTERN.test(recordId)
  ) {
    return undefined;
  }

  return {
    sharedUrl: url,
    canonicalUrl: `${workspaceBaseUrl}/object/${objectNameSingular}/${recordId}`,
    objectNameSingular,
    recordId,
  };
};

export const parseTwentyRecordLinks = ({
  workspaceBaseUrl,
  urls,
}: {
  workspaceBaseUrl: string;
  urls: string[];
}): SlackRecordLink[] => {
  const seenRecords = new Set<string>();
  const recordLinks: SlackRecordLink[] = [];

  for (const url of urls) {
    const recordLink = parseRecordLink({ workspaceBaseUrl, url });

    if (!isDefined(recordLink)) {
      continue;
    }

    const recordKey = `${recordLink.objectNameSingular}:${recordLink.recordId}`;

    if (seenRecords.has(recordKey)) {
      continue;
    }

    seenRecords.add(recordKey);
    recordLinks.push(recordLink);
  }

  return recordLinks;
};
