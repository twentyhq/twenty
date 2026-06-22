import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTimelineProjectionRuleInput } from 'src/engine/core-modules/timeline-feed/dtos/create-timeline-projection-rule.input';
import { UpdateTimelineProjectionRuleInput } from 'src/engine/core-modules/timeline-feed/dtos/update-timeline-projection-rule.input';
import { TimelineProjectionRuleEntity } from 'src/engine/core-modules/timeline-feed/timeline-projection-rule.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class TimelineProjectionRuleService {
  constructor(
    @InjectWorkspaceScopedRepository(TimelineProjectionRuleEntity)
    private readonly timelineProjectionRuleRepository: WorkspaceScopedRepository<TimelineProjectionRuleEntity>,
  ) {}

  getRules(workspaceId: string): Promise<TimelineProjectionRuleEntity[]> {
    return this.timelineProjectionRuleRepository.find(workspaceId, {
      order: { createdAt: 'ASC' },
    });
  }

  createRule(
    workspaceId: string,
    input: CreateTimelineProjectionRuleInput,
  ): Promise<TimelineProjectionRuleEntity> {
    return this.timelineProjectionRuleRepository.save(workspaceId, input);
  }

  async updateRule(
    workspaceId: string,
    { id, ...changes }: UpdateTimelineProjectionRuleInput,
  ): Promise<TimelineProjectionRuleEntity> {
    const rule = await this.findRuleOrThrow(workspaceId, id);

    return this.timelineProjectionRuleRepository.save(workspaceId, {
      ...rule,
      ...changes,
    });
  }

  async deleteRule(workspaceId: string, id: string): Promise<void> {
    await this.findRuleOrThrow(workspaceId, id);

    await this.timelineProjectionRuleRepository.delete(workspaceId, { id });
  }

  private async findRuleOrThrow(
    workspaceId: string,
    id: string,
  ): Promise<TimelineProjectionRuleEntity> {
    const rule = await this.timelineProjectionRuleRepository.findOne(
      workspaceId,
      { where: { id } },
    );

    if (rule === null) {
      throw new NotFoundException('Timeline projection rule not found');
    }

    return rule;
  }
}
