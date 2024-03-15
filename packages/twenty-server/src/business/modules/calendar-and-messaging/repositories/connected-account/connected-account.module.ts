import { Module } from '@nestjs/common';

import { ConnectedAccountService } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [ConnectedAccountService],
  exports: [ConnectedAccountService],
})
export class ConnectedAccountModule {}
