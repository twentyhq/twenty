import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_RECORD_CARD_LIMITS } from 'src/logic-functions/constants/slack-assistant-record-card-limits';
import { type SlackAssistantRecordCard } from 'src/logic-functions/types/slack-assistant-record-card.type';
import { type SlackAssistantRecordCardField } from 'src/logic-functions/types/slack-assistant-record-card-field.type';
import { type SlackAssistantRecordCardPayload } from 'src/logic-functions/types/slack-assistant-record-card-payload.type';
import { findSlackAssistantRecordReferences } from 'src/logic-functions/utils/find-slack-assistant-record-references';
import { isSlackAssistantRecordListAnswer } from 'src/logic-functions/utils/is-slack-assistant-record-list-answer';
import { sanitizeSlackRecordCardText } from 'src/logic-functions/utils/sanitize-slack-record-card-text';

const sanitizeCardFields = (
  fields: SlackAssistantRecordCardField[],
): SlackAssistantRecordCardField[] =>
  fields
    .map((field) => ({
      label: sanitizeSlackRecordCardText(
        field.label,
        SLACK_ASSISTANT_RECORD_CARD_LIMITS.MAX_LABEL_LENGTH,
      ),
      value: sanitizeSlackRecordCardText(
        field.value,
        SLACK_ASSISTANT_RECORD_CARD_LIMITS.MAX_VALUE_LENGTH,
      ),
    }))
    .filter(
      (field) => isNonEmptyString(field.label) && isNonEmptyString(field.value),
    )
    .slice(0, SLACK_ASSISTANT_RECORD_CARD_LIMITS.MAX_FIELDS);

// A card is a spotlight on one record: it only earns its space when the reply
// is about a single record and carries values worth pulling out of the prose.
export const resolveSlackAssistantRecordCard = ({
  answerText,
  recordCardPayload,
  workspaceBaseUrl,
}: {
  answerText: string;
  recordCardPayload: SlackAssistantRecordCardPayload | undefined;
  workspaceBaseUrl: string | undefined;
}): SlackAssistantRecordCard | undefined => {
  if (recordCardPayload === undefined) {
    return undefined;
  }

  if (isSlackAssistantRecordListAnswer({ answerText, workspaceBaseUrl })) {
    return undefined;
  }

  const cardRecordId = recordCardPayload.recordId.toLowerCase();

  // The card must point at a record the reply itself links, so a hallucinated
  // id never reaches Slack as a working record link.
  const recordReference = findSlackAssistantRecordReferences({
    responseText: answerText,
    workspaceBaseUrl,
  }).find((reference) => reference.recordId === cardRecordId);

  if (recordReference === undefined) {
    return undefined;
  }

  const fields = sanitizeCardFields(recordCardPayload.fields);

  if (fields.length === 0) {
    return undefined;
  }

  const title = [recordCardPayload.title, recordReference.name]
    .filter(isNonEmptyString)
    .map((candidate) =>
      sanitizeSlackRecordCardText(
        candidate,
        SLACK_ASSISTANT_RECORD_CARD_LIMITS.MAX_TITLE_LENGTH,
      ),
    )
    .find(isNonEmptyString);

  if (!isNonEmptyString(title)) {
    return undefined;
  }

  const subtitle = isNonEmptyString(recordCardPayload.subtitle)
    ? sanitizeSlackRecordCardText(
        recordCardPayload.subtitle,
        SLACK_ASSISTANT_RECORD_CARD_LIMITS.MAX_SUBTITLE_LENGTH,
      )
    : undefined;

  return {
    recordId: recordReference.recordId,
    objectNameSingular: recordReference.objectNameSingular,
    recordUrl: recordReference.recordUrl,
    title,
    subtitle: isNonEmptyString(subtitle) ? subtitle : undefined,
    fields,
  };
};
