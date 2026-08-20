import { Module } from '@nestjs/common';

import { ApplicationTriggeredByResolver } from 'src/engine/core-modules/application/application-triggered-by/application-triggered-by.resolver';
import { ApplicationTriggeredByService } from 'src/engine/core-modules/application/application-triggered-by/services/application-triggered-by.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [PermissionsModule, WorkspaceCacheModule],
  providers: [ApplicationTriggeredByResolver, ApplicationTriggeredByService],
})
export class ApplicationTriggeredByModule {}
