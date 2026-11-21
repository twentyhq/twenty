import { Module } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';

@Module({
  providers: [CommonRecordVisibilityService],
  exports: [CommonRecordVisibilityService],
})
export class CommonRecordVisibilityModule {}
