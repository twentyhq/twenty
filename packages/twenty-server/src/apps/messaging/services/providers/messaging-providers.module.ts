import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { GmailClientProvider } from 'src/apps/messaging/services/providers/gmail/gmail-client.provider';

@Module({
  imports: [EnvironmentModule],
  providers: [GmailClientProvider],
  exports: [GmailClientProvider],
})
export class MessagingProvidersModule {}
