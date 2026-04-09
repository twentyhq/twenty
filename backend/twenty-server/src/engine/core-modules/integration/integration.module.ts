import { Module } from '@nestjs/common';

import { IntegrationService } from './services/integration.service';

@Module({
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
