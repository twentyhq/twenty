import { type LogEntry } from './types/ai-layer-log.type';

export class AILayerLogFormatter {
  static format(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: entry.level,
      service: 'twenty-server',
      workspace_id: entry.workspaceId,
      profile_id: entry.profileId,
      message: entry.message,
      ...entry.metadata,
    });
  }

  static formatError(error: Error, workspaceId?: string): string {
    return this.format({
      level: 'error',
      workspaceId: workspaceId ?? 'unknown',
      message: error.message,
      metadata: {
        error_name: error.name,
        stack: error.stack,
      },
    });
  }
}
