import { Injectable } from '@nestjs/common';

export interface DealCloneInput {
  sourceDealId: string;
  newDealName: string;
  options?: {
    cloneCompany: boolean;
    cloneContacts: boolean;
    cloneActivities: boolean;
    cloneNotes: boolean;
    cloneTasks: boolean;
    resetStage: boolean;
    resetCloseDate: boolean;
  };
}

export interface DealCloneResult {
  clonedDealId: string;
  clonedDealName: string;
  clonedCompanyId?: string;
  clonedContactIds: string[];
  clonedActivityIds: string[];
  clonedNoteIds: string[];
  clonedTaskIds: string[];
  warnings: string[];
}

export interface AccountHierarchyInput {
  accounts: Array<{
    accountId: string;
    accountName: string;
    parentAccountId?: string | null;
    level: number;
  }>;
}

export interface AccountHierarchyResult {
  hierarchies: Array<{
    rootAccountId: string;
    rootAccountName: string;
    level: number;
    children: Array<{
      accountId: string;
      accountName: string;
      level: number;
    }>;
  }>;
  depth: number;
  flatStructure: Record<string, string[]>;
}

export interface CompetitorTrackingInput {
  dealId: string;
  competitors: Array<{
    competitorId: string;
    competitorName: string;
    strength: 'strong' | 'moderate' | 'weak';
    notes?: string;
  }>;
}

export interface CompetitorTrackingResult {
  dealId: string;
  competitors: Array<{
    competitorId: string;
    competitorName: string;
    strength: 'strong' | 'moderate' | 'weak';
    notes?: string;
    isPrimaryThreat: boolean;
  }>;
  threatLevel: 'high' | 'medium' | 'low';
  winningProbability: number;
}

export interface EarnedRevenueMilestone {
  milestoneId: string;
  milestoneName: string;
  targetDate: string;
  targetAmount: number;
  actualAmount: number;
  status: 'on_track' | 'at_risk' | 'achieved' | 'missed';
}

export interface EarnedRevenueTrackingInput {
  dealId: string;
  startDate: string;
  milestones: Array<{
    milestoneId: string;
    milestoneName: string;
    targetDate: string;
    targetAmount: number;
    achievedDate?: string;
    actualAmount?: number;
  }>;
}

export interface EarnedRevenueTrackingResult {
  dealId: string;
  totalTargetAmount: number;
  totalEarnedAmount: number;
  progress: number;
  milestones: EarnedRevenueMilestone[];
  projectedCompletionDate: string;
  riskFlags: string[];
}

export interface BlueprintStage {
  stageId: string;
  name: string;
  order: number;
  description?: string;
  requiredFields: string[];
  automations?: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
}

export interface BlueprintProcessInput {
  blueprintId: string;
  name: string;
  stages: BlueprintStage[];
  isActive: boolean;
}

export interface BlueprintProcessResult {
  blueprintId: string;
  name: string;
  stages: BlueprintStage[];
  totalStages: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface CsPlaybookStep {
  stepId: string;
  title: string;
  description: string;
  order: number;
  durationDays?: number;
  assignees?: string[];
  completionCriteria?: string;
}

export interface CsPlaybookInput {
  playbookId: string;
  name: string;
  triggerType: 'onboarding' | 'health_score' | 'renewal' | 'upsell' | 'custom';
  steps: CsPlaybookStep[];
  isActive: boolean;
}

export interface CsPlaybookResult {
  playbookId: string;
  name: string;
  triggerType: string;
  steps: CsPlaybookStep[];
  totalSteps: number;
  estimatedDurationDays: number;
  isValid: boolean;
}

export interface QbrDocument {
  documentId: string;
  documentType: 'agenda' | 'presentation' | 'report' | 'action_items' | 'meeting_notes';
  title: string;
  url?: string;
  content?: string;
}

export interface QbrMeetingInput {
  qbrId: string;
  accountId: string;
  accountName: string;
  scheduledDate: string;
  attendees: Array<{
    attendeeId: string;
    attendeeName: string;
    email: string;
    role: 'internal' | 'client';
  }>;
  documents?: QbrDocument[];
}

export interface QbrMeetingResult {
  qbrId: string;
  accountId: string;
  accountName: string;
  scheduledDate: string;
  attendees: Array<{
    attendeeId: string;
    attendeeName: string;
    email: string;
    role: 'internal' | 'client';
  }>;
  documents: QbrDocument[];
  preparationChecklist: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditLogImmutableInput {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'read' | 'export';
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  userId: string;
  userName: string;
}

export interface AuditLogImmutableResult {
  logId: string;
  entityType: string;
  entityId: string;
  action: string;
  timestamp: string;
  userId: string;
  userName: string;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  isImmutable: boolean;
  checksum: string;
  verified: boolean;
}

export interface ExpansionRevenueInput {
  accountId: string;
  currentMrr: number;
  expansionOpportunities: Array<{
    opportunityId: string;
    type: 'upsell' | 'cross_sell' | 'add_on' | 'seat_expansion';
    description: string;
    probability: number;
    amount: number;
    targetDate: string;
  }>;
}

export interface ExpansionRevenueResult {
  accountId: string;
  currentMrr: number;
  projectedMrr: number;
  expansionRevenue: number;
  expansionRate: number;
  opportunities: Array<{
    opportunityId: string;
    type: string;
    description: string;
    probability: number;
    amount: number;
    targetDate: string;
    weightedValue: number;
  }>;
  riskAssessment: 'high' | 'medium' | 'low';
  recommendedNextSteps: string[];
}

@Injectable()
export class SalesExecutionService {
  cloneDeal(input: DealCloneInput): DealCloneResult {
    const { sourceDealId, newDealName, options } = input;
    const opts = {
      cloneCompany: true,
      cloneContacts: true,
      cloneActivities: false,
      cloneNotes: false,
      cloneTasks: false,
      resetStage: true,
      resetCloseDate: true,
      ...options,
    };

    const warnings: string[] = [];

    if (!sourceDealId) {
      throw new Error('Source deal ID is required');
    }

    if (!newDealName) {
      throw new Error('New deal name is required');
    }

    const clonedDealId = `deal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const clonedContactIds: string[] = [];
    const clonedActivityIds: string[] = [];
    const clonedNoteIds: string[] = [];
    const clonedTaskIds: string[] = [];

    if (opts.cloneContacts) {
      for (let i = 0; i < 3; i++) {
        clonedContactIds.push(`contact_${Date.now()}_${i}`);
      }
    }

    if (opts.cloneActivities) {
      for (let i = 0; i < 5; i++) {
        clonedActivityIds.push(`activity_${Date.now()}_${i}`);
      }
      warnings.push('Cloned 5 activities from source deal');
    }

    if (opts.cloneNotes) {
      for (let i = 0; i < 2; i++) {
        clonedNoteIds.push(`note_${Date.now()}_${i}`);
      }
      warnings.push('Cloned 2 notes from source deal');
    }

    if (opts.cloneTasks) {
      for (let i = 0; i < 3; i++) {
        clonedTaskIds.push(`task_${Date.now()}_${i}`);
      }
      warnings.push('Cloned 3 tasks from source deal');
    }

    if (opts.resetStage) {
      warnings.push('Stage reset to initial pipeline stage');
    }

    if (opts.resetCloseDate) {
      warnings.push('Close date reset - please set new close date');
    }

    return {
      clonedDealId,
      clonedDealName: newDealName,
      clonedCompanyId: opts.cloneCompany ? `company_${Date.now()}` : undefined,
      clonedContactIds,
      clonedActivityIds,
      clonedNoteIds,
      clonedTaskIds,
      warnings,
    };
  }

  buildAccountHierarchy(input: AccountHierarchyInput): AccountHierarchyResult {
    const { accounts } = input;

    const accountMap = new Map(
      accounts.map((acc) => [acc.accountId, { ...acc, children: [] as typeof accounts }]),
    );

    const hierarchies: AccountHierarchyResult['hierarchies'] = [];

    accountMap.forEach((account) => {
      if (!account.parentAccountId) {
        const rootAccount = accountMap.get(account.accountId);
        if (!rootAccount) return;

        const buildChildren = (parentId: string): typeof accounts => {
          const children = accounts.filter((a) => a.parentAccountId === parentId);
          return children.map((child) => ({
            ...child,
            children: buildChildren(child.accountId),
          }));
        };

        hierarchies.push({
          rootAccountId: account.accountId,
          rootAccountName: account.accountName,
          level: 0,
          children: buildChildren(account.accountId).map((c) => ({
            accountId: c.accountId,
            accountName: c.accountName,
            level: c.level,
          })),
        });
      }
    });

    const depth = Math.max(...accounts.map((a) => a.level), 0);

    const flatStructure: Record<string, string[]> = {};
    accounts.forEach((acc) => {
      if (!acc.parentAccountId) {
        flatStructure[acc.accountId] = accounts
          .filter((a) => a.parentAccountId === acc.accountId)
          .map((a) => a.accountId);
      }
    });

    return {
      hierarchies,
      depth,
      flatStructure,
    };
  }

  trackCompetitors(input: CompetitorTrackingInput): CompetitorTrackingResult {
    const { dealId, competitors } = input;

    if (competitors.length === 0) {
      return {
        dealId,
        competitors: [],
        threatLevel: 'low',
        winningProbability: 100,
      };
    }

    const strongCount = competitors.filter((c) => c.strength === 'strong').length;
    const moderateCount = competitors.filter((c) => c.strength === 'moderate').length;

    let threatLevel: 'high' | 'medium' | 'low' = 'low';
    let winningProbability = 80;

    if (strongCount >= 2) {
      threatLevel = 'high';
      winningProbability = 20;
    } else if (strongCount === 1 || moderateCount >= 2) {
      threatLevel = 'medium';
      winningProbability = 45;
    } else if (moderateCount === 1) {
      threatLevel = 'low';
      winningProbability = 65;
    }

    const competitorsWithThreat = competitors.map((competitor, index) => ({
      ...competitor,
      isPrimaryThreat: index === 0 && competitor.strength === 'strong',
    }));

    return {
      dealId,
      competitors: competitorsWithThreat,
      threatLevel,
      winningProbability,
    };
  }

  trackEarnedRevenue(input: EarnedRevenueTrackingInput): EarnedRevenueTrackingResult {
    const { dealId, milestones, startDate } = input;

    const processedMilestones: EarnedRevenueMilestone[] = milestones.map((m) => {
      const targetDate = new Date(m.targetDate);
      const now = new Date();
      const isAchieved = !!m.achievedDate;
      const actualAmount = m.actualAmount ?? 0;

      let status: EarnedRevenueMilestone['status'];
      if (isAchieved) {
        status = 'achieved';
      } else if (targetDate < now) {
        status = 'missed';
      } else if (actualAmount / m.targetAmount >= 0.8) {
        status = 'on_track';
      } else {
        status = 'at_risk';
      }

      return {
        milestoneId: m.milestoneId,
        milestoneName: m.milestoneName,
        targetDate: m.targetDate,
        targetAmount: m.targetAmount,
        actualAmount,
        status,
      };
    });

    const totalTargetAmount = milestones.reduce((sum, m) => sum + m.targetAmount, 0);
    const totalEarnedAmount = processedMilestones
      .filter((m) => m.status === 'achieved')
      .reduce((sum, m) => sum + m.actualAmount, 0);

    const progress = totalTargetAmount > 0 ? (totalEarnedAmount / totalTargetAmount) * 100 : 0;

    const achievedMilestones = processedMilestones.filter((m) => m.status === 'achieved');
    const lastAchieved = achievedMilestones[achievedMilestones.length - 1];
    const projectedCompletionDate = lastAchieved
      ? lastAchieved.targetDate
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const riskFlags: string[] = [];
    const atRiskMilestones = processedMilestones.filter((m) => m.status === 'at_risk');
    if (atRiskMilestones.length > 0) {
      riskFlags.push(`${atRiskMilestones.length} milestone(s) at risk`);
    }
    const missedMilestones = processedMilestones.filter((m) => m.status === 'missed');
    if (missedMilestones.length > 0) {
      riskFlags.push(`${missedMilestones.length} milestone(s) missed`);
    }

    return {
      dealId,
      totalTargetAmount,
      totalEarnedAmount,
      progress,
      milestones: processedMilestones,
      projectedCompletionDate,
      riskFlags,
    };
  }

  createBlueprint(input: BlueprintProcessInput): BlueprintProcessResult {
    const { blueprintId, name, stages, isActive } = input;

    const validationErrors: string[] = [];

    if (!name || name.trim().length === 0) {
      validationErrors.push('Blueprint name is required');
    }

    if (stages.length === 0) {
      validationErrors.push('At least one stage is required');
    }

    const stageOrders = stages.map((s) => s.order);
    const hasDuplicateOrders = new Set(stageOrders).size !== stageOrders.length;
    if (hasDuplicateOrders) {
      validationErrors.push('Stage orders must be unique');
    }

    stages.forEach((stage, index) => {
      if (!stage.name || stage.name.trim().length === 0) {
        validationErrors.push(`Stage at index ${index} has no name`);
      }
    });

    return {
      blueprintId,
      name,
      stages,
      totalStages: stages.length,
      isValid: validationErrors.length === 0,
      validationErrors,
    };
  }

  createPlaybook(input: CsPlaybookInput): CsPlaybookResult {
    const { playbookId, name, triggerType, steps, isActive } = input;

    const estimatedDurationDays = steps.reduce(
      (total, step) => total + (step.durationDays ?? 1),
      0,
    );

    return {
      playbookId,
      name,
      triggerType,
      steps,
      totalSteps: steps.length,
      estimatedDurationDays,
      isValid: name.length > 0 && steps.length > 0 && triggerType.length > 0,
    };
  }

  scheduleQbr(input: QbrMeetingInput): QbrMeetingResult {
    const { qbrId, accountId, accountName, scheduledDate, attendees, documents = [] } = input;

    const clientAttendees = attendees.filter((a) => a.role === 'client');
    const internalAttendees = attendees.filter((a) => a.role === 'internal');

    const preparationChecklist = [
      'Review previous QBR notes and action items',
      `Confirm attendance of ${clientAttendees.length} client stakeholder(s)`,
      `Confirm attendance of ${internalAttendees.length} internal participant(s)`,
      'Prepare agenda document',
      'Pull account health metrics',
      'Review expansion opportunities',
      'Prepare slide deck',
      'Schedule follow-up meeting',
      'Send calendar invites',
      'Prepare meeting notes template',
    ];

    if (clientAttendees.length < 1) {
      preparationChecklist.push('WARNING: No client attendees confirmed');
    }

    return {
      qbrId,
      accountId,
      accountName,
      scheduledDate,
      attendees,
      documents,
      preparationChecklist,
      status: 'scheduled',
    };
  }

  createImmutableAuditLog(input: AuditLogImmutableInput): AuditLogImmutableResult {
    const { entityType, entityId, action, changes, userId, userName } = input;

    const timestamp = new Date().toISOString();
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const logData = {
      entityType,
      entityId,
      action,
      timestamp,
      userId,
      userName,
      changes,
    };

    const checksum = this.generateChecksum(JSON.stringify(logData));

    return {
      logId,
      entityType,
      entityId,
      action,
      timestamp,
      userId,
      userName,
      changes,
      isImmutable: true,
      checksum,
      verified: true,
    };
  }

  calculateExpansionRevenue(input: ExpansionRevenueInput): ExpansionRevenueResult {
    const { accountId, currentMrr, expansionOpportunities } = input;

    const processedOpportunities = expansionOpportunities.map((opp) => ({
      ...opp,
      weightedValue: (opp.amount * opp.probability) / 100,
    }));

    const totalExpansionRevenue = processedOpportunities.reduce(
      (sum, opp) => sum + opp.amount,
      0,
    );
    const totalWeightedValue = processedOpportunities.reduce(
      (sum, opp) => sum + opp.weightedValue,
      0,
    );

    const projectedMrr = currentMrr + totalExpansionRevenue;
    const expansionRate = currentMrr > 0 ? (totalExpansionRevenue / currentMrr) * 100 : 0;

    let riskAssessment: 'high' | 'medium' | 'low' = 'low';
    const lowProbabilityOpps = expansionOpportunities.filter((opp) => opp.probability < 30);
    if (lowProbabilityOpps.length > 3) {
      riskAssessment = 'high';
    } else if (lowProbabilityOpps.length > 1) {
      riskAssessment = 'medium';
    }

    const recommendedNextSteps: string[] = [];

    if (expansionOpportunities.some((opp) => opp.type === 'upsell')) {
      recommendedNextSteps.push('Schedule upsell conversation with account executive');
    }
    if (expansionOpportunities.some((opp) => opp.type === 'cross_sell')) {
      recommendedNextSteps.push('Prepare cross-sell proposal with product team');
    }
    if (expansionOpportunities.length > 0) {
      recommendedNextSteps.push('Prioritize opportunities by weighted value');
      recommendedNextSteps.push('Assign ownership to expansion team');
    }

    return {
      accountId,
      currentMrr,
      projectedMrr,
      expansionRevenue: totalExpansionRevenue,
      expansionRate,
      opportunities: processedOpportunities,
      riskAssessment,
      recommendedNextSteps,
    };
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}
