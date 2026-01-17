import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { AILayerService } from 'src/engine/core-modules/ai-layer';
import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';

@Injectable()
export class AILayerHealthIndicator {
  constructor(
    private readonly aiLayerService: AILayerService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('aiLayer');

    try {
      const health = await this.aiLayerService.checkHealth();

      const services = {
        ctxMcp: health.ctxMcp ? 'up' : 'down',
        kbMcp: health.kbMcp ? 'up' : 'down',
        n8n: health.n8n ? 'up' : 'down',
      };

      const allDown = !health.ctxMcp && !health.kbMcp && !health.n8n;
      const allUp = health.ctxMcp && health.kbMcp && health.n8n;

      if (allDown) {
        return indicator.down({
          message: HEALTH_ERROR_MESSAGES.AI_LAYER_ALL_SERVICES_DOWN,
          details: {
            services,
            timestamp: health.timestamp.toISOString(),
          },
        });
      }

      const status = allUp ? 'healthy' : 'degraded';

      return indicator.up({
        details: {
          status,
          services,
          timestamp: health.timestamp.toISOString(),
        },
      });
    } catch (error) {
      return indicator.down({
        message: HEALTH_ERROR_MESSAGES.AI_LAYER_CONNECTION_FAILED,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
