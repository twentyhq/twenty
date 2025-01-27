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

import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(private whatsappIntegrationService: WhatsappIntegrationService) {}

  @Get('/webhook/:id')
  async handleVerification(
    @Param('id') id: string,
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    console.log('Received challenge:', challenge);

    const integration = await this.whatsappIntegrationService.findById(id);

    console.log('===== integration: ', integration);

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

  @Post('/webhook/:id')
  async handleIncomingMessage(@Param('id') id: string, @Body() body: any) {
    this.logger.log(`${id} - Received incoming message: `, body);
  }
}
