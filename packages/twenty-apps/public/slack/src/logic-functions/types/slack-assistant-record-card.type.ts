import { type SlackAssistantRecordCardField } from 'src/logic-functions/types/slack-assistant-record-card-field.type';

export type SlackAssistantRecordCard = {
  recordId: string;
  objectNameSingular: string;
  recordUrl: string;
  title: string;
  subtitle?: string;
  fields: SlackAssistantRecordCardField[];
};
