export type AILayerLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: AILayerLogLevel;
  workspaceId: string;
  profileId?: string;
  message: string;
  metadata?: Record<string, unknown>;
};
