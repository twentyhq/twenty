/* @license Enterprise */

import { Module } from '@nestjs/common';

import { RecordSharingFeatureModule } from 'src/engine/core-modules/record-share/record-sharing-feature.module';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { ShareWithService } from 'src/engine/core-modules/record-share/services/share-with.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TwentyOrmModule,
    WorkspaceCacheModule,
    RecordSharingFeatureModule,
    RecordShareStorageModule,
  ],
  providers: [ShareWithService, RecordAccessPolicyService],
  exports: [
    RecordShareStorageModule,
    ShareWithService,
    RecordAccessPolicyService,
  ],
})
export class RecordShareModule {}
