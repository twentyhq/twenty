import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SdrAgent, SdrAgentStatus } from './sdr-agent.entity';

@Injectable()
export class SdrAgentService {
  constructor(
    @InjectRepository(SdrAgent, 'core')
    private readonly sdrAgentRepository: Repository<SdrAgent>,
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
}
