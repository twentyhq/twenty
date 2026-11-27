import { Module } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [CommonRecordVisibilityService],
  exports: [CommonRecordVisibilityService],
})
export class CommonRecordVisibilityModule {}
