import { Module } from '@nestjs/common';

import { AnalyticsModule } from 'src/engine/core-modules/audit/analytics.module';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    TimelineActivityModule,
    AnalyticsModule,
  ],
  providers: [CreateAuditLogFromInternalEvent],
})
export class AuditJobModule {}
