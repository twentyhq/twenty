import { Module } from '@nestjs/common';

import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';

import { ClientConfigController } from './client-config.controller';

import { ClientConfigService } from './services/client-config.service';

@Module({
  imports: [DomainServerConfigModule, AdminPanelModule],
  controllers: [ClientConfigController],
  providers: [ClientConfigService],
})
export class ClientConfigModule {}
