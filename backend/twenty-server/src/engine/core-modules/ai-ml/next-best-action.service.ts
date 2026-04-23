import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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

    for (const record of records.slice(0, 30)) {
      const candidateActions = this.generateCandidateActions(record, config);
      const sorted = candidateActions.sort((a, b) => b.score - a.score);

      if (sorted.length > 0) {
        const best = sorted[0];
        best.workspaceId = workspaceId;
        actions.push(best);
      }
    }

    const limitedActions = actions
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxActionsPerDay);

    return this.actionRepo.save(limitedActions);
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );
      const companyRepository =
        await this.globalWorkspaceOrmManager.getRepository<CompanyWorkspaceEntity>(
          workspaceId,
          'company',
          { shouldBypassPermissionChecks: true },
        );
      const personRepository =
        await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
          workspaceId,
          'person',
          { shouldBypassPermissionChecks: true },
        );

      const [opportunities, companies, people] = await Promise.all([
        opportunityRepository.find({
          order: { updatedAt: 'DESC' },
          take: 10,
        }),
        companyRepository.find({
          order: { updatedAt: 'DESC' },
          take: 10,
        }),
        personRepository.find({
          order: { updatedAt: 'DESC' },
          take: 10,
        }),
      ]);

      return [
        ...opportunities.map((opportunity) => ({
          id: opportunity.id,
          type: 'opportunity',
          name: opportunity.name,
          opportunity,
        })),
        ...companies.map((company) => ({
          id: company.id,
          type: 'company',
          name: this.getCompanyRecordName(company),
          company,
        })),
        ...people.map((person) => ({
          id: person.id,
          type: 'person',
          name: this.getPersonRecordName(person),
          person,
        })),
      ].filter((record) => isDefined(record.name));
    }, authContext);
  }

  private generateCandidateActions(
    record: {
      id: string;
      type: string;
      name: string;
      opportunity?: OpportunityWorkspaceEntity;
      company?: CompanyWorkspaceEntity;
      person?: PersonWorkspaceEntity;
    },
    config: NextBestActionConfigEntity,
  ): NextBestActionEntity[] {
    const actions: NextBestActionEntity[] = [];
    const now = new Date();
    const weightFor = (type: ActionType): number => config.actionWeights?.[type] ?? DEFAULT_WEIGHTS[type] ?? 1;
    const isExcluded = (type: ActionType): boolean => (config.excludedActionTypes ?? []).includes(type);

    if (record.type === 'opportunity' && isDefined(record.opportunity) && !isExcluded(ActionType.EMAIL)) {
      actions.push(this.createAction(record, {
        type: ActionType.EMAIL,
        description: `Send follow-up email for ${record.name}`,
        score: 0.75 * weightFor(ActionType.EMAIL),
        priority: NBAPriority.HIGH,
        scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      }));

      if (!isExcluded(ActionType.CALL)) {
        actions.push(this.createAction(record, {
          type: ActionType.CALL,
          description: `Schedule discovery call for ${record.name}`,
          score: this.getOpportunityCallScore(record.opportunity) * weightFor(ActionType.CALL),
          priority: NBAPriority.HIGH,
          scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        }));
      }

      if (!isExcluded(ActionType.SEQUENCE)) {
        actions.push(this.createAction(record, {
          type: ActionType.SEQUENCE,
          description: `Enroll ${record.name} in a follow-up sequence`,
          score: 0.62 * weightFor(ActionType.SEQUENCE),
          priority: NBAPriority.MEDIUM,
          scheduledAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        }));
      }
    }

    if (record.type === 'person' && isDefined(record.person)) {
      if (!isExcluded(ActionType.EMAIL)) {
        actions.push(this.createAction(record, {
          type: ActionType.EMAIL,
          description: `Share relevant case study with ${record.name}`,
          score: this.getPersonEmailScore(record.person) * weightFor(ActionType.EMAIL),
          priority: NBAPriority.MEDIUM,
          scheduledAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        }));
      }

      if (!isExcluded(ActionType.MEETING) && this.isDecisionMaker(record.person)) {
        actions.push(this.createAction(record, {
          type: ActionType.MEETING,
          description: `Book meeting with ${record.name}`,
          score: 0.78 * weightFor(ActionType.MEETING),
          priority: NBAPriority.HIGH,
          scheduledAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        }));
      }
    }

    if (record.type === 'company' && isDefined(record.company)) {
      if (!isExcluded(ActionType.CALL) && record.company.idealCustomerProfile) {
        actions.push(this.createAction(record, {
          type: ActionType.CALL,
          description: `Call ${record.name} about expansion`,
          score: 0.72 * weightFor(ActionType.CALL),
          priority: NBAPriority.MEDIUM,
          scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        }));
      }

      if (!isExcluded(ActionType.TASK)) {
        actions.push(this.createAction(record, {
          type: ActionType.TASK,
          description: `Research ${record.name} account profile`,
          score: 0.55 * weightFor(ActionType.TASK),
          priority: NBAPriority.LOW,
          scheduledAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        }));
      }
    }

    if (!isExcluded(ActionType.SCORING)) {
      actions.push(this.createAction(record, {
        type: ActionType.SCORING,
        description: `Refresh scoring for ${record.name}`,
        score: 0.45 * weightFor(ActionType.SCORING),
        priority: NBAPriority.LOW,
        scheduledAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
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
    } as unknown as NextBestActionEntity;
  }

  private getOpportunityCallScore(opportunity: OpportunityWorkspaceEntity): number {
    const stage = opportunity.stage?.toLowerCase?.() ?? '';

    if (stage === 'proposal' || stage === 'negotiation') return 0.95;
    if (stage === 'qualification' || stage === 'needs_analysis') return 0.8;
    return 0.7;
  }

  private getPersonEmailScore(person: PersonWorkspaceEntity): number {
    const jobTitle = person.jobTitle?.toLowerCase?.() ?? '';
    if (jobTitle.includes('vp') || jobTitle.includes('director') || jobTitle.includes('chief')) {
      return 0.88;
    }
    return 0.7;
  }

  private isDecisionMaker(person: PersonWorkspaceEntity): boolean {
    const jobTitle = person.jobTitle?.toLowerCase?.() ?? '';
    return jobTitle.includes('vp') || jobTitle.includes('director') || jobTitle.includes('chief') || jobTitle.includes('head');
  }

  private getCompanyRecordName(company: CompanyWorkspaceEntity): string {
    return company.name?.trim?.() || company.id;
  }

  private getPersonRecordName(person: PersonWorkspaceEntity): string {
    if (typeof person.name === 'string') return person.name;

    const fullName = person.name as unknown as
      | { firstName?: string; lastName?: string; middleName?: string; displayName?: string; name?: string }
      | null;

    const parts = [
      fullName?.firstName,
      fullName?.middleName,
      fullName?.lastName,
    ].filter((part): part is string => Boolean(part));

    return fullName?.displayName || fullName?.name || parts.join(' ') || person.id;
  }
}
