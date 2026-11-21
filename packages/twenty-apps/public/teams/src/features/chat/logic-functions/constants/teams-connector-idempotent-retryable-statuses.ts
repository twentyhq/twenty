// A gateway can answer 502 or 504 after the Connector accepted the request, so a POST is not resent on them.
export const TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES = new Set([
  502, 504,
]);
