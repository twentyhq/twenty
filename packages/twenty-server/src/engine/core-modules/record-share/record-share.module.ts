/* @license Enterprise */

import { ObjectAccessOverviewResolver } from 'src/engine/core-modules/record-share/resolvers/object-access-overview.resolver';
import { RecordSharingResolver } from 'src/engine/core-modules/record-share/resolvers/record-sharing.resolver';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ObjectAccessOverviewService } from 'src/engine/core-modules/record-share/services/object-access-overview.service';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { ShareWithService } from 'src/engine/core-modules/record-share/services/share-with.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RecordPermissionsModule } from 'src/engine/metadata-modules/record-permissions/record-permissions.module';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TwentyOrmModule,
    WorkspaceCacheModule,
    RecordShareStorageModule,
    PermissionsModule,
    RecordPermissionsModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    ShareWithService,
    RecordAccessPolicyService,
    RecordSharePrincipalService,
    RecordSharingService,
    RecordSharingResolver,
    ObjectAccessOverviewService,
    ObjectAccessOverviewResolver,
  ],
  exports: [
    RecordShareStorageModule,
    ShareWithService,
    RecordAccessPolicyService,
  ],
})
export class RecordShareModule {}
