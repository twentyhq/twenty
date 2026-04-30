import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';

import { WhatsAppService } from './whatsapp.service';
import { UnifiedInboxService } from './unified-inbox.service';
import { InboxChannel } from './unified-inbox.entity';

@Controller('rest/omnicanal')
export class OmnicanalController {
  private readonly logger = new Logger(OmnicanalController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly inboxService: UnifiedInboxService,
  ) {}

  @Post('webhook/whatsapp')
  @HttpCode(200)
  async handleWhatsAppWebhook(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      from: string;
      body: string;
      messageId?: string;
      senderName?: string;
      mediaUrl?: string;
      contactId?: string;
    },
  ) {
    this.logger.log(`WhatsApp incoming from ${payload.from} (workspace: ${workspaceId})`);

    const result = await this.inboxService.receiveMessage(workspaceId, {
      channel: InboxChannel.WHATSAPP,
      body: payload.body,
      participantIdentifier: payload.from,
      externalMessageId: payload.messageId,
      senderName: payload.senderName,
      mediaUrl: payload.mediaUrl,
      contactId: payload.contactId,
    });

    return {
      success: true,
      conversationId: result.conversation.id,
      messageId: result.message.id,
    };
  }

  @Post('webhook/sms')
  @HttpCode(200)
  async handleSMSWebhook(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      from: string;
      body: string;
      messageId?: string;
      contactId?: string;
    },
  ) {
    this.logger.log(`SMS incoming from ${payload.from} (workspace: ${workspaceId})`);

    const result = await this.inboxService.receiveMessage(workspaceId, {
      channel: InboxChannel.SMS,
      body: payload.body,
      participantIdentifier: payload.from,
      externalMessageId: payload.messageId,
      contactId: payload.contactId,
    });

    return {
      success: true,
      conversationId: result.conversation.id,
      messageId: result.message.id,
    };
  }

  @Post('chat/message')
  @HttpCode(200)
  async handleLiveChatMessage(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: {
      conversationId?: string;
      visitorId: string;
      body: string;
      senderName?: string;
      contactId?: string;
    },
  ) {
    this.logger.log(`Live chat message from ${payload.visitorId} (workspace: ${workspaceId})`);

    if (payload.conversationId) {
      const message = await this.inboxService.sendMessage(payload.conversationId, {
        body: payload.body,
        senderName: payload.senderName,
      });

      return { success: true, conversationId: payload.conversationId, messageId: message.id };
    }

    const result = await this.inboxService.receiveMessage(workspaceId, {
      channel: InboxChannel.CHAT,
      body: payload.body,
      participantIdentifier: payload.visitorId,
      senderName: payload.senderName,
      contactId: payload.contactId,
    });

    return {
      success: true,
      conversationId: result.conversation.id,
      messageId: result.message.id,
    };
  }
}
