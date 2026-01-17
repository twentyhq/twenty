import { ConsoleLogger, type LogLevel } from '@nestjs/common';

export interface AILayerLogContext {
  workspace_id?: string;
  profile_id?: string;
  correlation_id?: string;
  [key: string]: unknown;
}

export interface AILayerLogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  workspace_id?: string;
  profile_id?: string;
  correlation_id?: string;
  context?: Record<string, unknown>;
}

export class AILayerLogFormatter extends ConsoleLogger {
  private readonly useJsonFormat: boolean;
  private readonly serviceName: string;

  constructor(
    context?: string,
    options?: {
      logLevels?: LogLevel[];
    },
  ) {
    super(context ?? 'AILayerLogFormatter', {
      logLevels: options?.logLevels,
    });
    this.useJsonFormat =
      process.env.AI_LAYER_LOG_FORMAT?.toLowerCase() === 'json';
    this.serviceName = 'twenty-crm';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: any, context?: string, ...optionalParams: any[]): void {
    this.writeLog('log', message, context, optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: any, context?: string, ...optionalParams: any[]): void {
    this.writeLog('error', message, context, optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: any, context?: string, ...optionalParams: any[]): void {
    this.writeLog('warn', message, context, optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: any, context?: string, ...optionalParams: any[]): void {
    this.writeLog('debug', message, context, optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verbose(message: any, context?: string, ...optionalParams: any[]): void {
    this.writeLog('verbose', message, context, optionalParams);
  }

  private writeLog(
    level: LogLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    context?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionalParams: any[] = [],
  ): void {
    if (this.useJsonFormat) {
      this.writeJsonLog(level, message, context, optionalParams);
    } else {
      // Delegate to parent ConsoleLogger
      super[level](message, context, ...optionalParams);
    }
  }

  private writeJsonLog(
    level: LogLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    context?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionalParams: any[] = [],
  ): void {
    const aiLayerContext = this.extractAILayerContext(optionalParams);

    const logEntry: AILayerLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      workspace_id: aiLayerContext.workspace_id,
      profile_id: aiLayerContext.profile_id,
      correlation_id: aiLayerContext.correlation_id,
    };

    // Add additional context if present
    const additionalContext = this.extractAdditionalContext(
      optionalParams,
      aiLayerContext,
    );
    if (Object.keys(additionalContext).length > 0) {
      logEntry.context = additionalContext;
    }

    // Add context (category) if provided
    if (context) {
      logEntry.context = { ...logEntry.context, category: context };
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));
  }

  private extractAILayerContext(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionalParams: any[],
  ): AILayerLogContext {
    const context: AILayerLogContext = {};

    for (const param of optionalParams) {
      if (typeof param === 'object' && param !== null) {
        if ('workspace_id' in param) {
          context.workspace_id = String(param.workspace_id);
        }
        if ('profile_id' in param) {
          context.profile_id = String(param.profile_id);
        }
        if ('correlation_id' in param) {
          context.correlation_id = String(param.correlation_id);
        }
      }
    }

    return context;
  }

  private extractAdditionalContext(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionalParams: any[],
    excludeKeys: AILayerLogContext,
  ): Record<string, unknown> {
    const additionalContext: Record<string, unknown> = {};

    for (const param of optionalParams) {
      if (typeof param === 'object' && param !== null && !Array.isArray(param)) {
        for (const [key, value] of Object.entries(param)) {
          if (!(key in excludeKeys)) {
            additionalContext[key] = value;
          }
        }
      } else if (typeof param !== 'object' || param === null) {
        // Non-object params go into 'data' array
        if (!additionalContext.data) {
          additionalContext.data = [];
        }
        (additionalContext.data as unknown[]).push(param);
      }
    }

    return additionalContext;
  }
}
