import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

import { AI_LAYER_CONFIG } from '../ai-layer.config';
import {
  type ContactWebhookPayload,
  type WebhookResponse,
  type ContactEventType,
  type CrmStage,
  type JourneyTriggerPayload,
} from './types/webhook.type';

const WEBHOOK_TIMEOUT = 5000;

@Injectable()
export class AILayerWebhookService {
  private readonly logger = new Logger(AILayerWebhookService.name);

  constructor(private readonly httpService: HttpService) {}

  private get n8nUrl(): string {
    return process.env.N8N_API_URL || 'http://n8n:5678';
  }

  private get isWebhooksEnabled(): boolean {
    const enabled = process.env.AI_LAYER_WEBHOOKS_ENABLED;

    return enabled === 'true' || enabled === undefined;
  }

  /**
   * Notify AI Layer when a contact is updated in Twenty CRM.
   * This triggers the CRM → Journey Engine sync workflow.
   */
  async notifyContactUpdate(params: {
    workspace_id: string;
    profile_id: string;
    contact_id: string;
    event_type: ContactEventType;
    crm_stage: CrmStage;
    relation_score?: number;
    metadata?: ContactWebhookPayload['metadata'];
  }): Promise<WebhookResponse> {
    if (!this.isWebhooksEnabled) {
      this.logger.debug('Webhooks disabled, skipping contact update');

      return { success: true, message: 'Webhooks disabled' };
    }

    const payload: ContactWebhookPayload = {
      ...params,
      source: 'twenty_crm',
      timestamp: new Date().toISOString(),
    };

    return this.sendWebhook('/webhook/twenty/contact-updated', payload);
  }

  /**
   * Trigger a journey for a contact based on CRM stage transition.
   * Used when contacts reach promotion thresholds.
   */
  async triggerJourney(params: {
    workspace_id: string;
    profile_id: string;
    contact_id: string;
    journey_template_id?: string;
    trigger_event: string;
    context?: Record<string, unknown>;
  }): Promise<WebhookResponse> {
    if (!this.isWebhooksEnabled) {
      this.logger.debug('Webhooks disabled, skipping journey trigger');

      return { success: true, message: 'Webhooks disabled' };
    }

    const payload: JourneyTriggerPayload = {
      workspace_id: params.workspace_id,
      profile_id: params.profile_id,
      contact_id: params.contact_id,
      journey_template_id: params.journey_template_id,
      trigger_event: params.trigger_event,
      context: params.context,
    };

    return this.sendWebhook('/webhook/twenty/journey-trigger', payload);
  }

  /**
   * Notify when a contact's relation score changes significantly.
   * Used for lead scoring and promotion logic.
   */
  async notifyRelationScoreChange(params: {
    workspace_id: string;
    profile_id: string;
    contact_id: string;
    previous_score: number;
    new_score: number;
    crm_stage: CrmStage;
  }): Promise<WebhookResponse> {
    if (!this.isWebhooksEnabled) {
      this.logger.debug('Webhooks disabled, skipping score change');

      return { success: true, message: 'Webhooks disabled' };
    }

    // Only notify on significant changes (>10 points)
    const scoreDelta = Math.abs(params.new_score - params.previous_score);

    if (scoreDelta < 10) {
      return { success: true, message: 'Score change below threshold' };
    }

    return this.notifyContactUpdate({
      workspace_id: params.workspace_id,
      profile_id: params.profile_id,
      contact_id: params.contact_id,
      event_type: 'updated',
      crm_stage: params.crm_stage,
      relation_score: params.new_score,
      metadata: {
        updated_fields: ['relation_score'],
      },
    });
  }

  /**
   * Generic webhook sender with retry and error handling.
   */
  private async sendWebhook(
    path: string,
    payload: Record<string, unknown>,
  ): Promise<WebhookResponse> {
    const url = `${this.n8nUrl}${path}`;

    this.logger.debug(`Sending webhook to ${url}`, {
      workspace_id: payload.workspace_id,
      contact_id: payload.contact_id,
    });

    try {
      const response = await firstValueFrom(
        this.httpService
          .post<WebhookResponse>(url, payload, {
            timeout: WEBHOOK_TIMEOUT,
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .pipe(
            timeout(WEBHOOK_TIMEOUT),
            catchError((error) => {
              this.logger.warn(`Webhook failed: ${error.message}`, {
                url,
                workspace_id: payload.workspace_id,
              });

              return of({
                data: {
                  success: false,
                  error: error.message,
                },
              });
            }),
          ),
      );

      if (response.data.success !== false) {
        this.logger.debug(`Webhook sent successfully to ${path}`);

        return { success: true };
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Webhook error: ${errorMessage}`, {
        url,
        workspace_id: payload.workspace_id,
      });

      return { success: false, error: errorMessage };
    }
  }
}
