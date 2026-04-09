import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspacePlan } from 'src/engine/core-modules/workspace/enums/workspace-plan.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export interface PlanLimits {
  users: number;
  records: number;
  aiCreditsPerMonth: number;
  hasAI: boolean;
  hasCustomDomain: boolean;
  hasSSO: boolean;
  hasPrioritySupport: boolean;
  hasAPI: boolean;
}

export const WORKSPACE_PLAN_LIMITS: Record<WorkspacePlan, PlanLimits> = {
  [WorkspacePlan.FREE]: {
    users: 2,
    records: 1000,
    aiCreditsPerMonth: 50,
    hasAI: false,
    hasCustomDomain: false,
    hasSSO: false,
    hasPrioritySupport: false,
    hasAPI: false,
  },
  [WorkspacePlan.PRO]: {
    users: 10,
    records: -1, // Unlimited
    aiCreditsPerMonth: 1000,
    hasAI: true,
    hasCustomDomain: true,
    hasSSO: false,
    hasPrioritySupport: true,
    hasAPI: true,
  },
  [WorkspacePlan.ENTERPRISE]: {
    users: -1, // Unlimited
    records: -1, // Unlimited
    aiCreditsPerMonth: -1, // Unlimited
    hasAI: true,
    hasCustomDomain: true,
    hasSSO: true,
    hasPrioritySupport: true,
    hasAPI: true,
  },
};

@Injectable()
export class WorkspacePlanService {
  protected readonly logger = new Logger(WorkspacePlanService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getWorkspacePlan(workspaceId: string): Promise<WorkspacePlan> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['plan'],
    });

    return workspace?.plan ?? WorkspacePlan.FREE;
  }

  async getWorkspaceLimits(workspaceId: string): Promise<PlanLimits> {
    const plan = await this.getWorkspacePlan(workspaceId);
    return WORKSPACE_PLAN_LIMITS[plan];
  }

  async canUseFeature(
    workspaceId: string,
    feature: keyof PlanLimits,
  ): Promise<boolean> {
    const limits = await this.getWorkspaceLimits(workspaceId);

    if (typeof limits[feature] === 'boolean') {
      return limits[feature] as boolean;
    }

    return true;
  }

  async hasReachedUserLimit(workspaceId: string, currentCount: number): Promise<boolean> {
    const limits = await this.getWorkspaceLimits(workspaceId);

    if (limits.users === -1) return false;
    return currentCount >= limits.users;
  }

  async hasReachedRecordLimit(workspaceId: string, currentCount: number): Promise<boolean> {
    const limits = await this.getWorkspaceLimits(workspaceId);

    if (limits.records === -1) return false;
    return currentCount >= limits.records;
  }

  async isPlanActive(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['plan', 'activationStatus'],
    });

    if (!workspace) return false;
    return workspace.plan !== WorkspacePlan.FREE;
  }

  getPlanFromKey(planKey: string): WorkspacePlan {
    const validPlans = Object.values(WorkspacePlan);
    const normalizedKey = planKey.toUpperCase();

    if (validPlans.includes(normalizedKey as WorkspacePlan)) {
      return normalizedKey as WorkspacePlan;
    }

    return WorkspacePlan.FREE;
  }
}
