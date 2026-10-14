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
  application:
    | boolean
    | {
        withUser: boolean;
        withoutUser: boolean;
        // Tokens bound to an agent (the code interpreter's) also need this, which
        // `true` does not imply, so new endpoints stay closed to them
        withAgent: boolean;
      };
};
