import { Module } from '@nestjs/common';

import { IntegrationService } from './services/integration.service';
import { IntegrationResolver } from './integration.resolver';

@Module({
  providers: [IntegrationService, IntegrationResolver],
  exports: [IntegrationService],
})
export class IntegrationModule {}
