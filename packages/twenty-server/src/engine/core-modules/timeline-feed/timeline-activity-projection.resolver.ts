import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineActivityProjectionDTO } from 'src/engine/core-modules/timeline-feed/dtos/timeline-activity-projection.dto';
import { TimelineActivityProjectionService } from 'src/engine/core-modules/timeline-feed/services/timeline-activity-projection.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@ArgsType()
class GetTimelineActivityProjectionsArgs {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => UUIDScalarType)
  recordId: string;
}

@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
@CoreResolver(() => TimelineActivityProjectionDTO)
export class TimelineActivityProjectionResolver {
  constructor(
    private readonly timelineActivityProjectionService: TimelineActivityProjectionService,
  ) {}

  @Query(() => [TimelineActivityProjectionDTO])
  async getTimelineActivityProjections(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() {
      objectNameSingular,
      recordId,
    }: GetTimelineActivityProjectionsArgs,
  ): Promise<TimelineActivityProjectionDTO[]> {
    return this.timelineActivityProjectionService.getProjections({
      workspaceId: workspace.id,
      objectNameSingular,
      recordId,
    });
  }
}
