import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(
    private whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get('/webhook/:workspaceId/:id')
  async handleVerification(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    const integration = await this.whatsappIntegrationService.findById(
      id,
      workspaceId,
    );

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === integration?.verifyToken) {
        this.logger.log('Webhook verified successfully');

        return challenge;
      } else {
        throw new HttpException('Verification failed', HttpStatus.FORBIDDEN);
      }
    }

    throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
  }

  @Post('/webhook/:workspaceId/:id')
  async handleIncomingMessage(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    this.logger.log(`${id} - Received incoming message`);

    const isReceiving = !!body.entry[0].changes[0].value.messages;

    const messages = body.entry[0].changes[0].value.messages[0];

    let mediaId: string | undefined;
    let fileUrl;

    switch (messages.type) {
      case 'image':
        mediaId = messages.image.id;
        break;
      case 'audio':
        mediaId = messages.audio.id;
        break;
      case 'document':
        mediaId = messages.document.id;
        break;
      case 'video':
        mediaId = messages.video.id;
        break;
      default:
        mediaId = undefined;
        break;
    }

    if (isReceiving) {
      const lastMessage = {
        createdAt: new Date(),
        from: body.entry[0].changes[0].value.contacts[0].profile.name,
        message: mediaId
          ? fileUrl
          : body.entry[0].changes[0].value.messages[0].text.body,
        type: body.entry[0].changes[0].value.messages[0].type,
      };

      if (mediaId) {
        fileUrl = await this.whatsappService.downloadMedia(
          mediaId,
          id,
          body.entry[0].changes[0].value.messages[0].from,
          messages.type,
        );
      }

      const whatsappIntegration: Omit<
        WhatsappDocument,
        'timeline' | 'unreadMessages' | 'isVisible'
      > = {
        integrationId: id,
        client: {
          phone: body.entry[0].changes[0].value.messages[0].from,
          name: body.entry[0].changes[0].value.contacts[0].profile.name,
        },
        messages: [
          {
            ...lastMessage,
          },
        ],
        status: statusEnum.Waiting,
        lastMessage,
      };

      await this.whatsappService.saveMessageAtFirebase(
        whatsappIntegration,
        true,
      );
    }
  }
}
