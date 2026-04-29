import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { AsteriskService } from './asterisk.service';

@Controller('webhooks/asterisk')
export class AsteriskController {
  private readonly logger = new Logger(AsteriskController.name);

  constructor(private readonly service: AsteriskService) {}

  @Post('call-event')
  async handleCallEvent(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() body: {
      uniqueId: string;
      eventType: 'answer' | 'hangup' | 'dtmf' | 'recording_complete';
      data: Record<string, unknown>;
    },
  ) {
    this.logger.log(`Asterisk webhook: ${body.eventType} for call ${body.uniqueId} (workspace: ${workspaceId})`);
    const result = await this.service.handleCallEvent(workspaceId, body);
    return { success: true, callId: result?.id ?? null };
  }
}
