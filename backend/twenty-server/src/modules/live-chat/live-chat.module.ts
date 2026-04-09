import { Module } from '@nestjs/common';

import { LiveChatService } from 'src/modules/live-chat/services/live-chat.service';

@Module({
  providers: [LiveChatService],
  exports: [LiveChatService],
})
export class LiveChatModule {}
