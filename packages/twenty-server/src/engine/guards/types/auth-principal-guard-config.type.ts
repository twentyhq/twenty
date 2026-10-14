// Every kind and every variant is required, so a kind or variant added later
// fails to compile at every endpoint until someone decides for it.
export type AuthPrincipalGuardConfig = {
  userSession:
    | boolean
    | {
        standard: boolean;
        impersonated: boolean;
        playground: boolean;
        workspaceAgnostic: boolean;
      };
  apiKey: boolean;
  oauthClient: boolean | { withUser: boolean; withoutUser: boolean };
  application: boolean | { withUser: boolean; withoutUser: boolean };
  // Tokens bound to an agent (the code interpreter's) are refused unless an endpoint opts in,
  // so new endpoints stay closed to them
  isAgentTokenAccepted?: boolean;
};
