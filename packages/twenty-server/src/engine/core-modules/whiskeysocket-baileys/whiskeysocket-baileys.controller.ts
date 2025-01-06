import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whiskeysocket-baileys.service';
import { EventsGateway } from './events-gateway-module/events-gateway';
import { MessageDto } from './types/baileys-types';
import { WorkspaceQueryService } from '../workspace-modifications/workspace-modifications.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private eventsGateway: EventsGateway, 
    private workspaceQueryService: WorkspaceQueryService
  ) {}

  @Post('token')
  async token(@Body() body: { sessionId: string }) {
    await new WhatsappService(this.workspaceQueryService, this.eventsGateway, body.sessionId, '');
    return { status: 'ok' };
  }
  @Post('fetch-chats')
  async fetchChats(@Body() body: { phoneNumber: string }) {
    this.eventsGateway
    return { status: 'ok' };
  }

  @Post('send')
  async sendMessage(@Body() body: { message: string; jid: string; recruiterId: string }) {
    try {
      const sessionId = body?.recruiterId;
      console.log("Received sessionID from send API in baileyscontroller", sessionId);
      if (!sessionId) {
        console.log("Session ID IS NULL SO WHATSAPP MESSAGE NOT SENT");
      }

      const messageId = await this.eventsGateway.sendWhatsappMessage(body?.message, body?.jid, sessionId);
      if (messageId === 'failed') {

        return { status: 'failed' };
      } 
      else{
        return { status: 'ok' };
      }
    }
    catch (error) {
      console.log('Error sending message', error);
      return { status: 'failed' };
    }
  }

  // @Post('/send-wa-message-file')
  // async sendWAMessageFile(@Body() data: any): any {
  //   console.log(data);

  //   const bodyToSend: MessageDto = {
  //     WANumber: '919876512345',
  //     message: 'Hello',
  //     fileData: {
  //       fileBuffer: 'fileBuffer',
  //       fileName: 'fileName',
  //       mimetype: 'mimetype',
  //       filePath: 'filePath',
  //     },
  //     jid: '919876512345@s.whatsapp.net',

  //   }
  //   await this.eventsGateway.sendWhatsappFile(data?.fileToSendData, data?.recruiterId, data?.jid);
  // }

  @Post('/send-wa-message-file')
  async sendWAMessageFile(@Body() payload: { recruiterId: string; fileToSendData: MessageDto }): Promise<object> {
    console.log(payload);
    try {
      const messageId = await this.eventsGateway.sendWhatsappFile(payload);
      if (messageId === 'failed') {
        return { status: 'failed' };
      } 
      else{
        return { status: 'ok' };
      }    } catch {
      console.log('Error sending file');
      return { status: 'failed' };
    }
  }
}
