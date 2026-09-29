export type UserSessionCallerOptions = {
  impersonation?: boolean;
  playground?: boolean;
  workspaceAgnostic?: boolean;
};

export type ApplicationCallerOptions = {
  requireUser: true;
};

// A caller kind left out is refused.
export type CallerGuardConfig = {
  userSession?: true | UserSessionCallerOptions;
  apiKey?: true;
  oauthClient?: true | ApplicationCallerOptions;
  application?: true | ApplicationCallerOptions;
};
