import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { CreateTimelineProjectionRuleInput } from 'src/engine/core-modules/timeline-feed/dtos/create-timeline-projection-rule.input';
import { DeleteTimelineProjectionRuleInput } from 'src/engine/core-modules/timeline-feed/dtos/delete-timeline-projection-rule.input';
import { TimelineProjectionRuleDTO } from 'src/engine/core-modules/timeline-feed/dtos/timeline-projection-rule.dto';
import { UpdateTimelineProjectionRuleInput } from 'src/engine/core-modules/timeline-feed/dtos/update-timeline-projection-rule.input';
import { TimelineProjectionRuleService } from 'src/engine/core-modules/timeline-feed/services/timeline-projection-rule.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@CoreResolver(() => TimelineProjectionRuleDTO)
export class TimelineProjectionRuleResolver {
  constructor(
    private readonly timelineProjectionRuleService: TimelineProjectionRuleService,
  ) {}

  @Query(() => [TimelineProjectionRuleDTO])
  async getTimelineProjectionRules(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineProjectionRuleDTO[]> {
    return this.timelineProjectionRuleService.getRules(workspace.id);
  }

  @Mutation(() => TimelineProjectionRuleDTO)
  async createTimelineProjectionRule(
    @Args('input') input: CreateTimelineProjectionRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineProjectionRuleDTO> {
    return this.timelineProjectionRuleService.createRule(workspace.id, input);
  }

  @Mutation(() => TimelineProjectionRuleDTO)
  async updateTimelineProjectionRule(
    @Args('input') input: UpdateTimelineProjectionRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineProjectionRuleDTO> {
    return this.timelineProjectionRuleService.updateRule(workspace.id, input);
  }

  @Mutation(() => Boolean)
  async deleteTimelineProjectionRule(
    @Args('input') { id }: DeleteTimelineProjectionRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.timelineProjectionRuleService.deleteRule(workspace.id, id);

    return true;
  }
}
