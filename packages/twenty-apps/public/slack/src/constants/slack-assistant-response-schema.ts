// Agent response schemas only support flat scalar properties, so the record
// payload travels as a JSON string that parse-slack-assistant-answer validates.
// If the SDK gains nested schema support, `records` becomes a real array here
// and the parser drops its JSON.parse step; nothing else changes.
// twenty-sdk declares AgentResponseSchema but does not export it, so the shape
// is restated here; drop this alias once the SDK exports the type
type AgentResponseSchema = {
  type: 'object';
  properties: Record<
    string,
    { type: 'string' | 'number' | 'boolean'; description?: string }
  >;
  required?: string[];
  additionalProperties?: false;
};

export const SLACK_ASSISTANT_RESPONSE_SCHEMA: AgentResponseSchema = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description:
        'The reply itself, in standard Markdown, following the Slack reply style rules.',
    },
    layout: {
      type: 'string',
      description:
        'How to present the records: "plain" when the answer names no records worth summarizing, "record" when it is about one or a few specific records, "list" when the answer is a list of records worth comparing side by side.',
    },
    records: {
      type: 'string',
      description:
        'JSON array of the records the answer is about, or "[]" for none. Each item is {"objectNameSingular":"company","recordId":"<uuid from a tool result>","name":"Acme Corp","fields":[{"label":"Stage","value":"Proposal"}]}. Use the ids tool results returned, never invented ones. Give every record the same field labels in the same order when layout is "list".',
    },
  },
  required: ['answer', 'layout', 'records'],
  additionalProperties: false,
};
