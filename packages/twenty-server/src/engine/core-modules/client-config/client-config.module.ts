import { Module } from '@nestjs/common';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { ClientConfigResolver } from './client-config.resolver';

@Module({
  imports: [DomainManagerModule],
  providers: [ClientConfigResolver],
})
export class ClientConfigModule {}
