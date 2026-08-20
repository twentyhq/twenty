// The person a logic function run was started for. It travels as a token claim
// rather than as the token's user binding: binding a user turns the auth
// context into a user context, which narrows the run to the user's role and
// makes APPLICATION-writable records refuse the application's own writes.
export type ApplicationTriggeredBy = {
  userId: string;
  userWorkspaceId: string;
};
