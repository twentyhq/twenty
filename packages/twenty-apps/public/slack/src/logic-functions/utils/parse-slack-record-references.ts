import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const escapeForRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const parseSlackRecordReferences = ({
  responseText,
  workspaceBaseUrl,
}: {
  responseText: string;
  workspaceBaseUrl: string | undefined;
}): SlackRecordReference[] => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return [];
  }

  const recordLinkPattern = new RegExp(
    `\\[([^\\]\\n]+)\\]\\((${escapeForRegExp(workspaceBaseUrl)}/object/([a-zA-Z][a-zA-Z0-9]*)/(${UUID_PATTERN}))\\)`,
    'gi',
  );

  const referencesByRecordId = new Map<string, SlackRecordReference>();

  for (const match of responseText.matchAll(recordLinkPattern)) {
    const [, recordName, recordUrl, objectNameSingular, recordId] = match;

    if (!referencesByRecordId.has(recordId)) {
      referencesByRecordId.set(recordId, {
        objectNameSingular,
        recordId,
        recordName: recordName.trim(),
        recordUrl,
      });
    }
  }

  return [...referencesByRecordId.values()];
};
