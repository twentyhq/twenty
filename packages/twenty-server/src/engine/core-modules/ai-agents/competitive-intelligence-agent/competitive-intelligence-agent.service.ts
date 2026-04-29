import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitiveIntelligenceAgent, CIAgentStatus } from './competitive-intelligence-agent.entity';

@Injectable()
export class CompetitiveIntelligenceAgentService {
  constructor(
    @InjectRepository(CompetitiveIntelligenceAgent, 'core')
    private readonly repo: Repository<CompetitiveIntelligenceAgent>,
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

  async getStats(id: string, workspaceId: string): Promise<Record<string, number>> {
    const agent = await this.findOne(id, workspaceId);
    if (!agent) return { alertsGenerated: 0, battleCardsUpdated: 0 };
    return { alertsGenerated: agent.alertsGenerated, battleCardsUpdated: agent.battleCardsUpdated };
  }
}
