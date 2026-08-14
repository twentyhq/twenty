// Attached to every send as a Mailgun user variable and echoed back in
// webhook event payloads, so outbound events can be attributed to a
// workspace without provider state.
export const MAILGUN_WORKSPACE_VARIABLE_NAME = 'workspace_id';
