export type TeamsConversationMember = {
  id: string;
  objectId?: string;
  givenName?: string;
  surname?: string;
  name?: string;
  // Microsoft's guidance says bots cannot proactively read these two and must
  // use Graph, while the member payload schema still documents them. Treat as
  // optional until verified against a live tenant.
  email?: string;
  userPrincipalName?: string;
  tenantId?: string;
};
