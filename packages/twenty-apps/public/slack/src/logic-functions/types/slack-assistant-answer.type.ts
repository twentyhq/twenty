export const SLACK_ANSWER_LAYOUTS = ['plain', 'record', 'list'] as const;

export type SlackAnswerLayout = (typeof SLACK_ANSWER_LAYOUTS)[number];

export type SlackAnswerField = {
  label: string;
  value: string;
};

export type SlackAnswerRecord = {
  objectNameSingular: string;
  recordId: string;
  name: string;
  fields: SlackAnswerField[];
};

export type SlackAssistantAnswer = {
  answer: string;
  layout: SlackAnswerLayout;
  records: SlackAnswerRecord[];
};
