import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';
import { TimelineActivityProjectionService } from 'src/engine/core-modules/timeline-feed/services/timeline-activity-projection.service';
import { TimelineProjectionPolicyProvider } from 'src/engine/core-modules/timeline-feed/services/timeline-projection-policy.provider';
import { TimelineProjectionRuleService } from 'src/engine/core-modules/timeline-feed/services/timeline-projection-rule.service';
import { TimelineActivityProjectionResolver } from 'src/engine/core-modules/timeline-feed/timeline-activity-projection.resolver';
import { TimelineProjectionRuleEntity } from 'src/engine/core-modules/timeline-feed/timeline-projection-rule.entity';
import { TimelineProjectionRuleResolver } from 'src/engine/core-modules/timeline-feed/timeline-projection-rule.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    PermissionsModule,
    NestjsQueryTypeOrmModule.forFeature([TimelineProjectionRuleEntity]),
  ],
  providers: [
    RelatedRecordIdsService,
    TimelineProjectionPolicyProvider,
    TimelineActivityProjectionService,
    TimelineActivityProjectionResolver,
    TimelineProjectionRuleService,
    TimelineProjectionRuleResolver,
    provideWorkspaceScopedRepository(TimelineProjectionRuleEntity),
  ],
  exports: [RelatedRecordIdsService],
})
export class TimelineFeedModule {}
