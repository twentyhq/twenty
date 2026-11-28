import { Module } from '@nestjs/common';

import { CommonRecordReadCustomPermissionsService } from 'src/engine/api/common/common-record-read-custom-permissions/common-record-read-custom-permissions.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [CommonRecordReadCustomPermissionsService],
  exports: [CommonRecordReadCustomPermissionsService],
})
export class CommonRecordReadCustomPermissionsModule {}
