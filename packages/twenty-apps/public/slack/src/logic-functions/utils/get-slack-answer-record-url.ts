import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAnswerRecord } from 'src/logic-functions/types/slack-assistant-answer.type';

// the worker builds record links from the workspace URL it resolved itself, so
// a link can never point somewhere the agent made up
export const getSlackAnswerRecordUrl = ({
  record,
  workspaceBaseUrl,
}: {
  record: SlackAnswerRecord;
  workspaceBaseUrl: string | undefined;
}): string | undefined =>
  isNonEmptyString(workspaceBaseUrl)
    ? `${workspaceBaseUrl}/object/${record.objectNameSingular}/${record.recordId}`
    : undefined;
