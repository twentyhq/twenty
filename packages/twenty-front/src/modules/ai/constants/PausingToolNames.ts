import {
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_EMAIL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

// Tools whose call waits on a person, each rendered with its own status.
export const PAUSING_TOOL_NAMES: ReadonlySet<string> = new Set([
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_EMAIL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
]);
