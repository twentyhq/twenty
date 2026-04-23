import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProspectResearch, ProspectingResearchAgent, ResearchAgentStatus } from './prospecting-research-agent.entity';

@Injectable()
export class ProspectingResearchAgentService {
  constructor(
    @InjectRepository(ProspectingResearchAgent, 'core')
    private readonly agentRepo: Repository<ProspectingResearchAgent>,
    @InjectRepository(ProspectResearch, 'core')
    private readonly researchRepo: Repository<ProspectResearch>,
  ) {}

  async findAll(workspaceId: string): Promise<ProspectingResearchAgent[]> {
    return this.agentRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<ProspectingResearchAgent | null> {
    return this.agentRepo.findOne({ where: { id, workspaceId } });
  }

  async create(
    workspaceId: string,
    data: Partial<ProspectingResearchAgent> & { name: string },
  ): Promise<ProspectingResearchAgent> {
    const agent = this.agentRepo.create({
      ...data,
      workspaceId,
      status: data.status ?? ResearchAgentStatus.PAUSED,
      newsMonitoringEnabled: data.newsMonitoringEnabled ?? true,
      linkedInMonitoringEnabled: data.linkedInMonitoringEnabled ?? true,
      triggerEventsEnabled: data.triggerEventsEnabled ?? true,
      researchesCompletedCount: data.researchesCompletedCount ?? 0,
      triggersDetectedCount: data.triggersDetectedCount ?? 0,
    });

    return this.agentRepo.save(agent);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<ProspectingResearchAgent>,
  ): Promise<ProspectingResearchAgent> {
    await this.agentRepo.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`Prospecting research agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<ProspectingResearchAgent> {
    return this.update(id, workspaceId, { status: ResearchAgentStatus.ACTIVE, lastResearchAt: new Date() });
  }

  async pause(id: string, workspaceId: string): Promise<ProspectingResearchAgent> {
    return this.update(id, workspaceId, { status: ResearchAgentStatus.PAUSED });
  }

  async stop(id: string, workspaceId: string): Promise<ProspectingResearchAgent> {
    return this.update(id, workspaceId, { status: ResearchAgentStatus.STOPPED });
  }

  async recordResearch(
    workspaceId: string,
    data: {
      companyId?: string;
      contactId?: string;
      companyName?: string;
      companyDescription?: string;
      news?: Array<Record<string, unknown>>;
      fundingRounds?: Array<Record<string, unknown>>;
      hiringMoves?: Array<Record<string, unknown>>;
      intentSignals?: string[];
      isNewInformation?: boolean;
    },
  ): Promise<ProspectResearch> {
    const brief = this.buildBrief(data);
    const research = this.researchRepo.create({
      workspaceId,
      companyId: data.companyId ?? null,
      contactId: data.contactId ?? null,
      companyName: data.companyName ?? null,
      companyDescription: data.companyDescription ?? null,
      news: data.news ?? [],
      fundingRounds: data.fundingRounds ?? [],
      hiringMoves: data.hiringMoves ?? [],
      intentSignals: data.intentSignals ?? [],
      briefGenerated: brief,
      isNewInformation: data.isNewInformation ?? false,
    });

    return this.researchRepo.save(research);
  }

  async generateBrief(workspaceId: string, researchId: string): Promise<string> {
    const research = await this.researchRepo.findOne({ where: { workspaceId, id: researchId } });
    if (!research) throw new NotFoundException(`Prospect research ${researchId} not found`);
    return (
      research.briefGenerated ??
      this.buildBrief({
        companyName: research.companyName ?? undefined,
        companyDescription: research.companyDescription ?? undefined,
        news: research.news ?? undefined,
        fundingRounds: research.fundingRounds ?? undefined,
        hiringMoves: research.hiringMoves ?? undefined,
        intentSignals: research.intentSignals ?? undefined,
      })
    );
  }

  async summarizeResearch(workspaceId: string): Promise<{
    researchers: number;
    researches: number;
    newInformation: number;
    triggerSignals: number;
  }> {
    const [agents, researches] = await Promise.all([
      this.agentRepo.find({ where: { workspaceId } }),
      this.researchRepo.find({ where: { workspaceId } }),
    ]);

    return {
      researchers: agents.length,
      researches: researches.length,
      newInformation: researches.filter((item) => item.isNewInformation).length,
      triggerSignals: researches.reduce((sum, item) => sum + (item.intentSignals?.length ?? 0), 0),
    };
  }

  private buildBrief(input: {
    companyName?: string;
    companyDescription?: string;
    news?: Array<Record<string, unknown>>;
    fundingRounds?: Array<Record<string, unknown>>;
    hiringMoves?: Array<Record<string, unknown>>;
    intentSignals?: string[];
  }): string {
    const companyName = input.companyName?.trim() || 'the account';
    const description = input.companyDescription?.trim() || 'No description available.';
    const newsCount = input.news?.length ?? 0;
    const fundingCount = input.fundingRounds?.length ?? 0;
    const hiringCount = input.hiringMoves?.length ?? 0;
    const signals = input.intentSignals?.length ? input.intentSignals.slice(0, 4).join(', ') : 'none';

    return [
      `Company: ${companyName}`,
      `Description: ${description}`,
      `News items: ${newsCount}`,
      `Funding rounds: ${fundingCount}`,
      `Hiring moves: ${hiringCount}`,
      `Intent signals: ${signals}`,
    ].join('\n');
  }
}
