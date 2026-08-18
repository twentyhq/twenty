import { type SlackAssistantRecordCardField } from 'src/logic-functions/types/slack-assistant-record-card-field.type';

// Raw card the agent appends to its reply, before it is matched against the
// records the reply actually links to.
export type SlackAssistantRecordCardPayload = {
  recordId: string;
  title?: string;
  subtitle?: string;
  fields: SlackAssistantRecordCardField[];
};
