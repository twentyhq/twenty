import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitiveIntelligenceAgent, CIAgentStatus } from './competitive-intelligence-agent.entity';
import { AIGovernanceService } from '../../ai-governance/ai-governance.service';

@Injectable()
export class CompetitiveIntelligenceAgentService {
  private readonly logger = new Logger(CompetitiveIntelligenceAgentService.name);

  constructor(
    @InjectRepository(CompetitiveIntelligenceAgent, 'core')
    private readonly repo: Repository<CompetitiveIntelligenceAgent>,
    private readonly aiGovernance: AIGovernanceService,
  ) {}

  async findAll(workspaceId: string): Promise<CompetitiveIntelligenceAgent[]> {
    return this.repo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, workspaceId: string): Promise<CompetitiveIntelligenceAgent | null> {
    return this.repo.findOne({ where: { id, workspaceId } });
  }

  async create(data: Partial<CompetitiveIntelligenceAgent>, workspaceId: string): Promise<CompetitiveIntelligenceAgent> {
    return this.repo.save(this.repo.create({ ...data, workspaceId }));
  }

  async update(id: string, data: Partial<CompetitiveIntelligenceAgent>, workspaceId: string): Promise<CompetitiveIntelligenceAgent> {
    await this.repo.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`CI agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<CompetitiveIntelligenceAgent> {
    return this.update(id, { status: CIAgentStatus.ACTIVE, lastRunAt: new Date() }, workspaceId);
  }

  async pause(id: string, workspaceId: string): Promise<CompetitiveIntelligenceAgent> {
    return this.update(id, { status: CIAgentStatus.PAUSED }, workspaceId);
  }

  async getBattleCard(id: string, workspaceId: string, competitorName: string): Promise<Record<string, unknown> | null> {
    const agent = await this.findOne(id, workspaceId);
    return agent?.battleCards?.[competitorName] ?? null;
  }

  async updateBattleCard(
    id: string,
    workspaceId: string,
    competitorName: string,
    card: { strengths: string[]; weaknesses: string[]; differentiators: string[]; commonObjections: string[]; winStrategy: string },
  ): Promise<CompetitiveIntelligenceAgent> {
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`CI agent ${id} not found`);
    const cards = agent.battleCards ?? {};
    cards[competitorName] = { ...card, lastUpdated: new Date().toISOString() };
    agent.battleCards = cards;
    agent.battleCardsUpdated++;
    return this.repo.save(agent);
  }

  async generateBattleCard(
    agentId: string,
    workspaceId: string,
    userId: string,
    competitorName: string,
    context?: {
      ourProduct?: string;
      industry?: string;
      targetSegment?: string;
      knownStrengths?: string[];
      knownWeaknesses?: string[];
    },
  ): Promise<{
    strengths: string[];
    weaknesses: string[];
    differentiators: string[];
    commonObjections: string[];
    winStrategy: string;
  }> {
    const agent = await this.findOne(agentId, workspaceId);
    if (!agent) throw new NotFoundException(`CI agent ${agentId} not found`);

    try {
      const contextLines = [
        `Competitor: ${competitorName}`,
        context?.ourProduct ? `Our product: ${context.ourProduct}` : null,
        context?.industry ? `Industry: ${context.industry}` : null,
        context?.targetSegment ? `Target segment: ${context.targetSegment}` : null,
        context?.knownStrengths?.length
          ? `Known strengths: ${context.knownStrengths.join(', ')}`
          : null,
        context?.knownWeaknesses?.length
          ? `Known weaknesses: ${context.knownWeaknesses.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await this.aiGovernance.callLLM(workspaceId, userId, {
        feature: 'competitive-intelligence-battle-card',
        messages: [
          {
            role: 'system',
            content:
              'You are a competitive intelligence analyst. Generate a comprehensive battle card for competing against the specified competitor. Return a JSON object with: strengths (array of 4-6 competitor strengths), weaknesses (array of 4-6 competitor weaknesses), differentiators (array of 4-6 ways we differ from them), commonObjections (array of 4-6 common objections prospects raise about us vs them and how to handle them), winStrategy (a paragraph describing the best strategy to win against this competitor).',
          },
          {
            role: 'user',
            content: `Generate a battle card for competing against:\n\n${contextLines}`,
          },
        ],
        temperature: 0.6,
        maxTokens: 1536,
        jsonMode: true,
      });

      const battleCard = JSON.parse(response.content) as {
        strengths: string[];
        weaknesses: string[];
        differentiators: string[];
        commonObjections: string[];
        winStrategy: string;
      };

      // Save the generated battle card
      await this.updateBattleCard(agentId, workspaceId, competitorName, battleCard);

      return battleCard;
    } catch (error) {
      this.logger.warn(
        `LLM battle card generation failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );

      // Return a basic fallback
      const fallbackCard = {
        strengths: [`${competitorName} has established market presence`],
        weaknesses: ['Competitor analysis requires more data'],
        differentiators: ['Our platform offers deeper CRM integration'],
        commonObjections: [`"Why not use ${competitorName}?" - Emphasize our unique value proposition`],
        winStrategy: `Focus on demonstrating concrete ROI advantages over ${competitorName} through live demos and customer references.`,
      };

      await this.updateBattleCard(agentId, workspaceId, competitorName, fallbackCard);

      return fallbackCard;
    }
  }

  async getStats(id: string, workspaceId: string): Promise<Record<string, number>> {
    const agent = await this.findOne(id, workspaceId);
    if (!agent) return { alertsGenerated: 0, battleCardsUpdated: 0 };
    return { alertsGenerated: agent.alertsGenerated, battleCardsUpdated: agent.battleCardsUpdated };
  }
}
