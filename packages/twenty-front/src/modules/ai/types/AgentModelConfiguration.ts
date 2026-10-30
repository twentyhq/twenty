export type AgentModelConfiguration = {
  webSearch?: {
    enabled: boolean;
    configuration?: Record<string, unknown>;
  };
  twitterSearch?: {
    enabled: boolean;
    configuration?: Record<string, unknown>;
  };
};
