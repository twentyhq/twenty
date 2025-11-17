import { forwardRef, Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { UpsertRecordService } from 'src/engine/core-modules/record-crud/services/upsert-record.service';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';

@Module({
  imports: [
    forwardRef(() => CoreCommonApiModule),
    WorkspaceMetadataCacheModule,
  ],
  providers: [
    CommonApiContextBuilder,
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
