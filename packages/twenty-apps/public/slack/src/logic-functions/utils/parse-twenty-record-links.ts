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
  workspaceBaseUrls,
  url,
}: {
  workspaceBaseUrls: string[];
  url: string;
}): SlackRecordLink | undefined => {
  const normalizedUrl = url.replace(/&amp;/g, '&');

  const matchedBaseUrl = workspaceBaseUrls.find((baseUrl) =>
    normalizedUrl.startsWith(`${baseUrl}/`),
  );

  if (!isDefined(matchedBaseUrl)) {
    return undefined;
  }

  const path = normalizedUrl.slice(matchedBaseUrl.length);
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
    canonicalUrl: `${workspaceBaseUrls[0]}/object/${objectNameSingular}/${recordId}`,
    objectNameSingular,
    recordId,
  };
};

export const parseTwentyRecordLinks = ({
  workspaceBaseUrls,
  urls,
}: {
  workspaceBaseUrls: string[];
  urls: string[];
}): SlackRecordLink[] => {
  const seenRecords = new Set<string>();
  const recordLinks: SlackRecordLink[] = [];

  for (const url of urls) {
    const recordLink = parseRecordLink({ workspaceBaseUrls, url });

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
