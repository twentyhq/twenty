import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { UpsertRecordService } from 'src/engine/core-modules/record-crud/services/upsert-record.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CoreCommonApiModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    UserRoleModule,
    ApiKeyModule,
  ],
  providers: [
    CommonApiContextBuilderService,
    CreateRecordService,
    UpdateRecordService,
    DeleteRecordService,
    FindRecordsService,
    UpsertRecordService,
  ],
  exports: [
    CreateRecordService,
    UpdateRecordService,
    DeleteRecordService,
    FindRecordsService,
    UpsertRecordService,
  ],
})
export class RecordCrudModule {}
