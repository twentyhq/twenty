import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

import { AI_LAYER_CONFIG } from './ai-layer.config';
import {
  type AILayerErrorReport,
  type AILayerErrorResponse,
} from './types/ai-layer-error.type';

type HealthCheckResult = {
  ctxMcp: boolean;
  kbMcp: boolean;
  n8n: boolean;
  timestamp: Date;
};

@Injectable()
export class AILayerService {
  private readonly logger = new Logger(AILayerService.name);

  constructor(private readonly httpService: HttpService) {}

  private get errorEndpoint(): string {
    return (
      process.env.AI_LAYER_ERROR_ENDPOINT ||
      'http://ctx-mcp:3100/api/errors/report'
    );
  }

  private get isErrorReportingEnabled(): boolean {
    const enabled = process.env.AI_LAYER_ERROR_REPORTING_ENABLED;

    return enabled === 'true' || enabled === undefined;
  }

  private get ctxMcpUrl(): string {
    return process.env.CTX_MCP_URL || 'http://ctx-mcp:3100';
  }

  private get kbMcpUrl(): string {
    return process.env.KB_MCP_URL || 'http://kb-mcp:3110';
  }

  private get n8nUrl(): string {
    return process.env.N8N_API_URL || 'http://n8n:5678';
  }

  async reportError(
    errorReport: AILayerErrorReport,
  ): Promise<AILayerErrorResponse> {
    if (!this.isErrorReportingEnabled) {
      this.logger.debug('Error reporting disabled, skipping');

      return { success: true, error: 'Error reporting disabled' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService
          .post<AILayerErrorResponse>(this.errorEndpoint, errorReport, {
            timeout: AI_LAYER_CONFIG.ERROR_REPORT_TIMEOUT,
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .pipe(
            timeout(AI_LAYER_CONFIG.ERROR_REPORT_TIMEOUT),
            catchError((error) => {
              this.logger.warn(
                `Failed to report error to AI Layer: ${error.message}`,
              );

              return of({
                data: {
                  success: false,
                  error: error.message,
                },
              });
            }),
          ),
      );

      if (response.data.success) {
        this.logger.debug(
          `Error reported to AI Layer: ${errorReport.error_type}`,
        );
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Error reporting failed: ${errorMessage}`);

      return { success: false, error: errorMessage };
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const checkEndpoint = async (url: string): Promise<boolean> => {
      try {
        const response = await firstValueFrom(
          this.httpService.get(url).pipe(
            timeout(AI_LAYER_CONFIG.HEALTH_CHECK_TIMEOUT),
            catchError(() => of({ status: 0 })),
          ),
        );

        return response.status === 200;
      } catch {
        return false;
      }
    };

    const [ctxMcp, kbMcp, n8n] = await Promise.all([
      checkEndpoint(`${this.ctxMcpUrl}/healthz`),
      checkEndpoint(`${this.kbMcpUrl}/health`),
      checkEndpoint(`${this.n8nUrl}/healthz`),
    ]);

    return {
      ctxMcp,
      kbMcp,
      n8n,
      timestamp: new Date(),
    };
  }

  async getContext(params: {
    workspace_id: string;
    profile_id: string;
    mode?: 'full' | 'summary' | 'indices_only';
    include_recent_events?: boolean;
  }): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.ctxMcpUrl}/mcp`, {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'ctx_get_context',
              arguments: params,
            },
          })
          .pipe(
            timeout(AI_LAYER_CONFIG.HEALTH_CHECK_TIMEOUT * 2),
            catchError((error) => {
              this.logger.warn(`Failed to get context: ${error.message}`);

              return of({ data: { result: null } });
            }),
          ),
      );

      return response.data.result;
    } catch (error) {
      this.logger.error(
        `Context retrieval failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );

      return null;
    }
  }
}
