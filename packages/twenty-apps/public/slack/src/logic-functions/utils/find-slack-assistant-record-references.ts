import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantRecordReference } from 'src/logic-functions/types/slack-assistant-record-reference.type';

const UUID_PATTERN_SOURCE =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRecordUrlPattern = (workspaceBaseUrl: string): RegExp =>
  new RegExp(
    `(?:\\[([^\\]\\n]*)\\]\\()?(${escapeRegExp(workspaceBaseUrl)}/object/([a-zA-Z][a-zA-Z0-9]*)/(${UUID_PATTERN_SOURCE}))`,
    'gi',
  );

// Every record the agent names is written as a Markdown link to its Twenty
// page, so the reply itself tells us which records the answer is about.
export const findSlackAssistantRecordReferences = ({
  responseText,
  workspaceBaseUrl,
}: {
  responseText: string;
  workspaceBaseUrl: string | undefined;
}): SlackAssistantRecordReference[] => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return [];
  }

  const referencesByRecordId = new Map<string, SlackAssistantRecordReference>();
  const recordUrlPattern = buildRecordUrlPattern(workspaceBaseUrl);

  for (const match of responseText.matchAll(recordUrlPattern)) {
    const [, linkLabel, recordUrl, objectNameSingular, recordId] = match;
    const normalizedRecordId = recordId.toLowerCase();
    const name = linkLabel?.trim();
    const existingReference = referencesByRecordId.get(normalizedRecordId);

    if (!existingReference) {
      referencesByRecordId.set(normalizedRecordId, {
        recordId: normalizedRecordId,
        objectNameSingular,
        recordUrl,
        name: isNonEmptyString(name) ? name : undefined,
      });

      continue;
    }

    if (!isNonEmptyString(existingReference.name) && isNonEmptyString(name)) {
      referencesByRecordId.set(normalizedRecordId, {
        ...existingReference,
        name,
      });
    }
  }

  return [...referencesByRecordId.values()];
};
