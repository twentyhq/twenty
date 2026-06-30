import { Module } from '@nestjs/common';

import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';

import { ClientConfigController } from './client-config.controller';
import { ClientConfigResolver } from './client-config.resolver';

import { ClientConfigService } from './services/client-config.service';

@Module({
  imports: [DomainServerConfigModule, AdminPanelModule],
  controllers: [ClientConfigController],
  providers: [ClientConfigResolver, ClientConfigService],
})
export class ClientConfigModule {}
