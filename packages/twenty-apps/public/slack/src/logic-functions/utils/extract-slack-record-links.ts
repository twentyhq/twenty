import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const extractSlackRecordLinks = ({
  responseText,
  workspaceBaseUrl,
}: {
  responseText: string;
  workspaceBaseUrl: string | undefined;
}): SlackRecordLink[] => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return [];
  }

  const recordLinkPattern = new RegExp(
    `\\[([^\\]]+)\\]\\((${escapeRegExp(workspaceBaseUrl)}/object/([a-zA-Z][a-zA-Z0-9]*)/([a-zA-Z0-9-]+))\\)`,
    'g',
  );

  const recordLinksById = new Map<string, SlackRecordLink>();

  for (const match of responseText.matchAll(recordLinkPattern)) {
    const [, linkLabel, recordUrl, objectNameSingular, recordId] = match;

    if (recordLinksById.has(recordId)) {
      continue;
    }

    recordLinksById.set(recordId, {
      objectNameSingular,
      recordId,
      recordUrl,
      linkLabel: linkLabel.trim(),
      startIndex: match.index ?? 0,
    });
  }

  return [...recordLinksById.values()];
};
