import { Module } from '@nestjs/common';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { WorkspaceEventsConsumer } from 'src/engine/core-modules/audit/jobs/workspace-events.consumer';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

@Module({
  imports: [TimelineActivityModule, AuditModule],
  providers: [CreateAuditLogFromInternalEvent, WorkspaceEventsConsumer],
})
export class AuditJobModule {}
