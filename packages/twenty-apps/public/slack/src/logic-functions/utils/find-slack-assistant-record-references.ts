import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantRecordReference } from 'src/logic-functions/types/slack-assistant-record-reference.type';
import { buildSlackRecordUrlPatternSource } from 'src/logic-functions/utils/build-slack-record-url-pattern-source';

// Every record the agent names is written as a Markdown link to its Twenty
// page, so the reply itself tells us which records the answer touches.
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
  const recordUrlPattern = new RegExp(
    `(?:\\[([^\\]\\n]*)\\]\\()?(${buildSlackRecordUrlPatternSource(workspaceBaseUrl)})`,
    'gi',
  );

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
