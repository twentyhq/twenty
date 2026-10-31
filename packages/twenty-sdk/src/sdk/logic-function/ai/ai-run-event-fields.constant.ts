export const AI_RUN_EVENT_FIELDS = `
  id
  runId
  type
  createdAt
  role
  text
  toolCallId
  toolName
  input
  output
  isError
  error
  usage {
    inputTokens
    outputTokens
  }
`;
