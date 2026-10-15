export type ApplicationReach =
  // system, member sessions, API keys, OAuth-only clients
  | { kind: 'workspace' }
  // the workspace custom application
  | { kind: 'composer'; applicationId: string }
  // an installed application, with or without a member or an agent
  | { kind: 'confined'; applicationId: string };
