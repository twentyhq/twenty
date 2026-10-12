/* @license Enterprise */

import { RecordSharingResolver } from 'src/engine/core-modules/record-share/resolvers/record-sharing.resolver';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { Module } from '@nestjs/common';

import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { ShareWithService } from 'src/engine/core-modules/record-share/services/share-with.service';
import { RecordPermissionsModule } from 'src/engine/metadata-modules/record-permissions/record-permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordShareStorageModule,
    RecordPermissionsModule,
  ],
  providers: [
    ShareWithService,
    RecordAccessPolicyService,
    RecordSharePrincipalService,
    RecordSharingService,
    RecordSharingResolver,
  ],
  exports: [
    RecordShareStorageModule,
    ShareWithService,
    RecordAccessPolicyService,
    RecordSharingService,
  ],
})
export class RecordShareModule {}
