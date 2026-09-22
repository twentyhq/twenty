// TODO(@abdulrahmancodes): settle against a live tenant whether a bot can read
// email and userPrincipalName from this payload or has to go through Graph.
export type TeamsConversationMember = {
  id: string;
  objectId?: string;
  givenName?: string;
  surname?: string;
  name?: string;
  email?: string;
  userPrincipalName?: string;
  tenantId?: string;
};
