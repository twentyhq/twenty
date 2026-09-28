/* @license Enterprise */

import { RecordSharingResolver } from 'src/engine/core-modules/record-share/resolvers/record-sharing.resolver';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
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
  providers: [
    ShareWithService,
    RecordAccessPolicyService,
    RecordSharingService,
    RecordSharingResolver,
  ],
  exports: [
    RecordShareStorageModule,
    RecordSharingService,
    ShareWithService,
    RecordAccessPolicyService,
  ],
})
export class RecordShareModule {}
