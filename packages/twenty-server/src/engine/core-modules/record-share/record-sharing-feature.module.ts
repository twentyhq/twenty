import { Module } from '@nestjs/common';

import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RecordSharingFeatureService],
  exports: [RecordSharingFeatureService],
})
export class RecordSharingFeatureModule {}
