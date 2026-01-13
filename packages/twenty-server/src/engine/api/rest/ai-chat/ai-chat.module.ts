import { Module } from '@nestjs/common';

import { AIChatController } from './ai-chat.controller';
import { AIChatService } from './ai-chat.service';

@Module({
  controllers: [AIChatController],
  providers: [AIChatService],
  exports: [AIChatService],
})
export class AIChatModule {}
