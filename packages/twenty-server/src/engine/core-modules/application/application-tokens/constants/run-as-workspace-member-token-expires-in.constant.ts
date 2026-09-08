// A member-scoped token is minted for a single read on somebody's behalf, so it
// expires well before the application access token that requested it.
export const RUN_AS_WORKSPACE_MEMBER_TOKEN_EXPIRES_IN = '2m';
