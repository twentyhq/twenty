import { Module } from '@nestjs/common';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [CommonRecordVisibilityService],
  exports: [CommonRecordVisibilityService],
})
export class CommonRecordVisibilityModule {}
