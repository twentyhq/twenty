import { Module } from '@nestjs/common';
import { WhatsappService } from './whiskeysocket-baileys.service';
import { WhatsappController } from './whiskeysocket-baileys.controller';
import { EventsGateway } from './events-gateway-module/events-gateway';
import {WorkspaceModificationsModule} from 'src/engine/core-modules/workspace-modifications/workspace-modifications.module'; // Add this import

@Module({
  imports: [
    WorkspaceModificationsModule // Import the module that provides WorkspaceQueryService
  ],
  providers: [EventsGateway],
  controllers: [WhatsappController],
})
export class WhiskeySocketsBaileysWhatsappModule {}
