// Renew before the token actually lapses so a long-running worker cannot start
// a request with a token that expires mid-flight.
export const TEAMS_CONNECTOR_TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
