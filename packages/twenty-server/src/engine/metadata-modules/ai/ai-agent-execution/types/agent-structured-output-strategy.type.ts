// same-request puts the schema on the turn's own model request; follow-up-request converts its text afterwards
export type AgentStructuredOutputStrategy =
  | 'follow-up-request'
  | 'same-request';
