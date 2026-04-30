import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsmAgent, CsmAgentStatus } from './csm-agent.entity';
import { AIGovernanceService } from '../../ai-governance/ai-governance.service';

@Injectable()
export class CsmAgentService {
  private readonly logger = new Logger(CsmAgentService.name);

  constructor(
    @InjectRepository(CsmAgent, 'core')
    private readonly csmAgentRepository: Repository<CsmAgent>,
    private readonly aiGovernance: AIGovernanceService,
  ) {}

  async findAll(workspaceId: string): Promise<CsmAgent[]> {
    return this.csmAgentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<CsmAgent | null> {
    return this.csmAgentRepository.findOne({
      where: { id, workspaceId },
    });
  }

  async create(data: Partial<CsmAgent>, workspaceId: string): Promise<CsmAgent> {
    const agent = this.csmAgentRepository.create({
      ...data,
      workspaceId,
    });
    return this.csmAgentRepository.save(agent);
  }

  async update(id: string, data: Partial<CsmAgent>, workspaceId: string): Promise<CsmAgent> {
    await this.csmAgentRepository.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`CSM agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<CsmAgent> {
    return this.update(id, { status: CsmAgentStatus.ACTIVE, lastRunAt: new Date() }, workspaceId);
  }

  async pause(id: string, workspaceId: string): Promise<CsmAgent> {
    return this.update(id, { status: CsmAgentStatus.PAUSED }, workspaceId);
  }

  async triggerPlaybook(agentId: string, accountId: string, trigger: string, workspaceId: string): Promise<void> {
    const agent = await this.findOne(agentId, workspaceId);
    if (!agent || agent.status !== CsmAgentStatus.ACTIVE) return;

    await this.csmAgentRepository.increment(
      { id: agentId, workspaceId },
      'playbooksTriggeredCount',
      1,
    );
  }

  async suggestRetentionAction(
    workspaceId: string,
    userId: string,
    customerHealth: {
      accountName: string;
      healthScore: number;
      npsScore?: number;
      lastLoginDaysAgo?: number;
      contractEndDate?: string;
      mrr?: number;
      supportTicketsOpen?: number;
      featureAdoptionPercent?: number;
      recentEvents?: string[];
    },
  ): Promise<{
    action: string;
    reason: string;
    urgency: string;
    channel: string;
    talkingPoints: string[];
  }> {
    try {
      const contextLines = [
        `Account: ${customerHealth.accountName}`,
        `Health Score: ${customerHealth.healthScore}/100`,
        customerHealth.npsScore !== undefined ? `NPS: ${customerHealth.npsScore}` : null,
        customerHealth.lastLoginDaysAgo !== undefined ? `Last login: ${customerHealth.lastLoginDaysAgo} days ago` : null,
        customerHealth.contractEndDate ? `Contract ends: ${customerHealth.contractEndDate}` : null,
        customerHealth.mrr !== undefined ? `MRR: $${customerHealth.mrr.toLocaleString()}` : null,
        customerHealth.supportTicketsOpen !== undefined ? `Open tickets: ${customerHealth.supportTicketsOpen}` : null,
        customerHealth.featureAdoptionPercent !== undefined ? `Feature adoption: ${customerHealth.featureAdoptionPercent}%` : null,
        customerHealth.recentEvents?.length
          ? `Recent events: ${customerHealth.recentEvents.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await this.aiGovernance.callLLM(workspaceId, userId, {
        feature: 'csm-agent-retention',
        messages: [
          {
            role: 'system',
            content:
              'You are a customer success expert specializing in retention strategy. Analyze the customer health data and suggest the best retention action. Return a JSON object with: action (specific action to take), reason (why this action), urgency (critical/high/medium/low), channel (email/call/meeting/in-app), talkingPoints (array of 3-5 key talking points for the conversation).',
          },
          {
            role: 'user',
            content: `Suggest a retention action for this at-risk customer:\n\n${contextLines}`,
          },
        ],
        temperature: 0.5,
        maxTokens: 768,
        jsonMode: true,
      });

      return JSON.parse(response.content) as {
        action: string;
        reason: string;
        urgency: string;
        channel: string;
        talkingPoints: string[];
      };
    } catch (error) {
      this.logger.warn(
        `LLM retention suggestion failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );

      // Fallback heuristic
      const urgency = customerHealth.healthScore < 40 ? 'critical' : customerHealth.healthScore < 60 ? 'high' : 'medium';

      return {
        action: `Schedule an executive business review with ${customerHealth.accountName}`,
        reason: `Health score is ${customerHealth.healthScore}/100 - proactive engagement needed`,
        urgency,
        channel: 'meeting',
        talkingPoints: [
          'Review current business objectives and alignment',
          'Discuss product adoption and identify training gaps',
          'Address any open support concerns',
        ],
      };
    }
  }
}
