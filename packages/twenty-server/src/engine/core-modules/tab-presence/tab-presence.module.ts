import { Module } from '@nestjs/common';

import { TabPresenceResolver } from 'src/engine/core-modules/tab-presence/tab-presence.resolver';
import { TabPresenceService } from 'src/engine/core-modules/tab-presence/services/tab-presence.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [TabPresenceService, TabPresenceResolver],
  exports: [TabPresenceService],
})
export class TabPresenceModule {}
