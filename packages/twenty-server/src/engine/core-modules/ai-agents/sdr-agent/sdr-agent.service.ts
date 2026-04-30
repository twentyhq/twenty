import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SdrAgent, SdrAgentStatus } from './sdr-agent.entity';
import { AIGovernanceService } from '../../ai-governance/ai-governance.service';

@Injectable()
export class SdrAgentService {
  private readonly logger = new Logger(SdrAgentService.name);

  constructor(
    @InjectRepository(SdrAgent, 'core')
    private readonly sdrAgentRepository: Repository<SdrAgent>,
    private readonly aiGovernance: AIGovernanceService,
  ) {}

  async findAll(workspaceId: string): Promise<SdrAgent[]> {
    return this.sdrAgentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<SdrAgent | null> {
    return this.sdrAgentRepository.findOne({
      where: { id, workspaceId },
    });
  }

  async create(data: Partial<SdrAgent>, workspaceId: string): Promise<SdrAgent> {
    const agent = this.sdrAgentRepository.create({
      ...data,
      workspaceId,
    });
    return this.sdrAgentRepository.save(agent);
  }

  async update(id: string, data: Partial<SdrAgent>, workspaceId: string): Promise<SdrAgent> {
    await this.sdrAgentRepository.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`SDR agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<SdrAgent> {
    return this.update(id, { status: SdrAgentStatus.ACTIVE, lastRunAt: new Date() }, workspaceId);
  }

  async pause(id: string, workspaceId: string): Promise<SdrAgent> {
    return this.update(id, { status: SdrAgentStatus.PAUSED }, workspaceId);
  }

  async stop(id: string, workspaceId: string): Promise<SdrAgent> {
    return this.update(id, { status: SdrAgentStatus.STOPPED }, workspaceId);
  }

  async getStats(id: string, workspaceId: string): Promise<Record<string, number>> {
    const agent = await this.findOne(id, workspaceId);
    if (!agent) {
      return { qualifiedLeads: 0, meetingsBooked: 0, responseRate: 0 };
    }
    return {
      qualifiedLeads: agent.qualifiedLeadsCount,
      meetingsBooked: agent.meetingsBookedCount,
      responseRate: agent.responseRate,
    };
  }

  async runAgentCycle(
    agentId: string,
    workspaceId: string,
    userId: string,
    leads: Array<{
      name: string;
      email: string;
      company?: string;
      title?: string;
      industry?: string;
    }>,
  ): Promise<Array<{ leadName: string; outreachMessage: string; subject: string }>> {
    const agent = await this.findOne(agentId, workspaceId);

    if (!agent || agent.status !== SdrAgentStatus.ACTIVE) {
      throw new NotFoundException('SDR agent not found or not active');
    }

    const results: Array<{ leadName: string; outreachMessage: string; subject: string }> = [];
    const remainingCapacity = agent.dailyOutreachLimit - agent.outreachCountToday;
    const leadsToProcess = leads.slice(0, Math.max(0, remainingCapacity));

    for (const lead of leadsToProcess) {
      try {
        const icpContext = agent.icpCriteria ? `ICP criteria: ${agent.icpCriteria}` : '';
        const personaContext = agent.personaConfig
          ? `Persona: ${JSON.stringify(agent.personaConfig)}`
          : '';

        const response = await this.aiGovernance.callLLM(workspaceId, userId, {
          feature: 'sdr-agent-outreach',
          messages: [
            {
              role: 'system',
              content: `You are an expert SDR (Sales Development Representative). Generate personalized outreach messages that are concise, relevant, and drive responses. ${icpContext} ${personaContext} Return a JSON object with: subject (email subject line), message (the outreach email body).`,
            },
            {
              role: 'user',
              content: `Generate a personalized outreach message for this lead:\nName: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company ?? 'Unknown'}\nTitle: ${lead.title ?? 'Unknown'}\nIndustry: ${lead.industry ?? 'Unknown'}`,
            },
          ],
          temperature: 0.7,
          maxTokens: 768,
          jsonMode: true,
        });

        const parsed = JSON.parse(response.content) as {
          subject: string;
          message: string;
        };

        results.push({
          leadName: lead.name,
          outreachMessage: parsed.message,
          subject: parsed.subject,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to generate outreach for ${lead.name}: ${error instanceof Error ? error.message : 'unknown'}`,
        );

        results.push({
          leadName: lead.name,
          outreachMessage: `Hi ${lead.name}, I noticed ${lead.company ?? 'your company'} might benefit from our solution. Would you be open to a quick conversation?`,
          subject: `Quick question for ${lead.name}`,
        });
      }
    }

    // Update agent stats
    agent.outreachCountToday += results.length;
    agent.lastRunAt = new Date();
    await this.sdrAgentRepository.save(agent);

    return results;
  }
}
