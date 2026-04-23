import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsmAgent, CsmAgentStatus } from './csm-agent.entity';

@Injectable()
export class CsmAgentService {
  constructor(
    @InjectRepository(CsmAgent, 'core')
    private readonly csmAgentRepository: Repository<CsmAgent>,
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
}
