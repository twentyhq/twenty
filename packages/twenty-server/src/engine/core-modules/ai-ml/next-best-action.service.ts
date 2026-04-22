import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  NextBestActionConfigEntity,
  NextBestActionEntity,
  ActionOutcomeLogEntity,
  ActionType,
  NBAPriority,
} from './next-best-action.entity';

const DEFAULT_WEIGHTS: Record<string, number> = {
  [ActionType.EMAIL]: 0.8,
  [ActionType.CALL]: 0.9,
  [ActionType.MEETING]: 1.0,
  [ActionType.TASK]: 0.7,
  [ActionType.SEQUENCE]: 0.6,
  [ActionType.SCORING]: 0.5,
};

@Injectable()
export class NextBestActionService {
  constructor(
    @InjectRepository(NextBestActionConfigEntity)
    private readonly configRepo: Repository<NextBestActionConfigEntity>,
    @InjectRepository(NextBestActionEntity)
    private readonly actionRepo: Repository<NextBestActionEntity>,
    @InjectRepository(ActionOutcomeLogEntity)
    private readonly outcomeRepo: Repository<ActionOutcomeLogEntity>,
  ) {}

  async getConfig(workspaceId: string): Promise<NextBestActionConfigEntity> {
    let config = await this.configRepo.findOne({ where: { workspaceId } });
    if (!config) {
      config = this.configRepo.create({
        workspaceId,
        enabled: true,
        actionWeights: DEFAULT_WEIGHTS,
        maxActionsPerDay: 3,
      });
      config = await this.configRepo.save(config);
    }
    return config;
  }

  async computeActions(workspaceId: string): Promise<NextBestActionEntity[]> {
    const config = await this.getConfig(workspaceId);
    if (!config.enabled) return [];

    await this.actionRepo.update(
      { workspaceId, completed: false },
      { dismissedAt: new Date() },
    );

    const records = await this.fetchRecordsForActions(workspaceId);
    const actions: NextBestActionEntity[] = [];

    for (const record of records.slice(0, 20)) {
      const candidateActions = this.generateCandidateActions(record, config);
      const sorted = candidateActions.sort((a, b) => b.score - a.score);
      
      if (sorted.length > 0) {
        const best = sorted[0];
        best.workspaceId = workspaceId;
        actions.push(best);
      }
    }

    return this.actionRepo.save(actions);
  }

  async getActions(
    workspaceId: string,
    options: { recordId?: string; pending?: boolean; limit?: number } = {},
  ): Promise<NextBestActionEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (options.recordId) where.recordId = options.recordId;
    if (options.pending) {
      where.completed = false;
      where.dismissedAt = null;
    }

    return this.actionRepo.find({
      where,
      order: { score: 'DESC', generatedAt: 'DESC' },
      take: options.limit || 10,
    });
  }

  async completeAction(
    workspaceId: string,
    actionId: string,
    outcome?: { converted?: boolean; notes?: string },
  ): Promise<void> {
    const action = await this.actionRepo.findOne({ where: { workspaceId, id: actionId } });
    if (!action) return;

    action.completed = true;
    action.completedAt = new Date();
    await this.actionRepo.save(action);

    if (outcome) {
      const outcomeLog = this.outcomeRepo.create({
        workspaceId,
        actionId,
        actionType: action.actionType,
        predictedScore: action.score,
        converted: outcome.converted || false,
        notes: outcome.notes,
      });
      await this.outcomeRepo.save(outcomeLog);
    }
  }

  async dismissAction(workspaceId: string, actionId: string): Promise<void> {
    await this.actionRepo.update(actionId, { dismissedAt: new Date() });
  }

  private async fetchRecordsForActions(workspaceId: string): Promise<Array<{ id: string; type: string; name: string }>> {
    return [
      { id: '1', type: 'opportunity', name: 'Acme Corp Deal' },
      { id: '2', type: 'person', name: 'John Smith' },
      { id: '3', type: 'company', name: 'TechStart Inc' },
    ];
  }

  private generateCandidateActions(
    record: { id: string; type: string; name: string },
    config: NextBestActionConfigEntity,
  ): NextBestActionEntity[] {
    const actions: NextBestActionEntity[] = [];
    const now = new Date();

    if (record.type === 'opportunity') {
      actions.push(this.createAction(record, {
        type: ActionType.EMAIL,
        description: 'Send follow-up email',
        score: 0.85,
        priority: NBAPriority.HIGH,
        scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      }));

      actions.push(this.createAction(record, {
        type: ActionType.CALL,
        description: 'Schedule discovery call',
        score: 0.9,
        priority: NBAPriority.HIGH,
        scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      }));
    }

    if (record.type === 'person') {
      actions.push(this.createAction(record, {
        type: ActionType.EMAIL,
        description: 'Share relevant case study',
        score: 0.7,
        priority: NBAPriority.MEDIUM,
        scheduledAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      }));
    }

    return actions;
  }

  private createAction(
    record: { id: string; type: string; name: string },
    options: {
      type: ActionType;
      description: string;
      score: number;
      priority: NBAPriority;
      scheduledAt: Date;
    },
  ): NextBestActionEntity {
    return {
      id: '',
      workspaceId: '',
      recordId: record.id,
      recordType: record.type,
      recordName: record.name,
      actionType: options.type,
      actionDescription: options.description,
      actionDetails: null,
      score: options.score,
      priority: options.priority,
      scheduledAt: options.scheduledAt,
      completedAt: null,
      completed: false,
      completedBy: null,
      generatedAt: new Date(),
      dismissedAt: null,
    } as NextBestActionEntity;
  }
}