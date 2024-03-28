import { Module } from '@nestjs/common';

import { MessagingApp } from 'src/apps/messaging/messaging.app';

@Module({
  imports: [MessagingApp],
  providers: [],
  exports: [],
})
export class AppsModule {}
