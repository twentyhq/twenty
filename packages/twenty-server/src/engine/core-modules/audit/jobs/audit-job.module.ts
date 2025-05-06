import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    TimelineActivityModule,
    AuditModule,
  ],
  providers: [CreateAuditLogFromInternalEvent],
})
export class AuditJobModule {}
