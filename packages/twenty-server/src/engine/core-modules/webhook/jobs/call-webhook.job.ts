import { HttpService } from '@nestjs/axios';

import crypto from 'crypto';

import { getAbsoluteUrl } from 'twenty-shared/utils';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { WEBHOOK_RESPONSE_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/webhook/webhook-response';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type CallWebhookJobData = {
  targetUrl: string;
  eventName: string;
  objectMetadata: { id: string; nameSingular: string };
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any;
  updatedFields?: string[];
  secret?: string;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  constructor(
    private readonly httpService: HttpService,
    private readonly auditService: AuditService,
  ) {}

  private generateSignature(
    payload: CallWebhookJobData,
    secret: string,
    timestamp: string,
  ): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${JSON.stringify(payload)}`)
      .digest('hex');
  }

  @Process(CallWebhookJob.name)
  async handle(data: CallWebhookJobData): Promise<void> {
    const commonPayload = {
      url: data.targetUrl,
      webhookId: data.webhookId,
      eventName: data.eventName,
    };
    const analytics = this.auditService.createContext({
      workspaceId: data.workspaceId,
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const { secret, ...payloadWithoutSecret } = data;

      if (secret) {
        headers['X-Twenty-Webhook-Timestamp'] = Date.now().toString();
        headers['X-Twenty-Webhook-Signature'] = this.generateSignature(
          payloadWithoutSecret,
          secret,
          headers['X-Twenty-Webhook-Timestamp'],
        );
        headers['X-Twenty-Webhook-Nonce'] = crypto
          .randomBytes(16)
          .toString('hex');
      }

      const response = await this.httpService.axiosRef.post(
        getAbsoluteUrl(data.targetUrl),
        payloadWithoutSecret,
        { headers },
      );

      const success = response.status >= 200 && response.status < 300;

      analytics.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        status: response.status,
        success,
        ...commonPayload,
      });
    } catch (err) {
      analytics.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        success: false,
        ...commonPayload,
        ...(err.response && { status: err.response.status }),
      });
    }
  }
}
