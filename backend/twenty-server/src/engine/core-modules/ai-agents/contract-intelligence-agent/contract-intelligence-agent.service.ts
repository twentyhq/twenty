import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ContractIntelligenceAgent, ContractAgentStatus, ContractExtractionEntity } from './contract-intelligence-agent.entity';

@Injectable()
export class ContractIntelligenceAgentService {
  constructor(
    @InjectRepository(ContractIntelligenceAgent, 'core')
    private readonly agentRepo: Repository<ContractIntelligenceAgent>,
    @InjectRepository(ContractExtractionEntity, 'core')
    private readonly extractionRepo: Repository<ContractExtractionEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<ContractIntelligenceAgent[]> {
    return this.agentRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<ContractIntelligenceAgent>, workspaceId: string): Promise<ContractIntelligenceAgent> {
    return this.agentRepo.save(this.agentRepo.create({ ...data, workspaceId }));
  }

  async start(id: string, workspaceId: string): Promise<ContractIntelligenceAgent> {
    await this.agentRepo.update({ id, workspaceId }, { status: ContractAgentStatus.ACTIVE, lastRunAt: new Date() } as never);
    const agent = await this.agentRepo.findOne({ where: { id, workspaceId } });
    if (!agent) throw new NotFoundException(`Contract agent ${id} not found`);
    return agent;
  }

  async saveExtraction(workspaceId: string, data: Partial<ContractExtractionEntity>): Promise<ContractExtractionEntity> {
    const extraction = await this.extractionRepo.save(this.extractionRepo.create({ workspaceId, ...data }));
    if (data.agentId) {
      await this.agentRepo.increment({ id: data.agentId }, 'contractsProcessed', 1);
      if (data.riskFlags?.length) {
        await this.agentRepo.increment({ id: data.agentId }, 'risksIdentified', data.riskFlags.length);
      }
      if (data.renewalDate) {
        await this.agentRepo.increment({ id: data.agentId }, 'renewalsDetected', 1);
      }
    }
    return extraction;
  }

  async getUpcomingRenewals(workspaceId: string, withinDays: number): Promise<ContractExtractionEntity[]> {
    const cutoff = new Date(Date.now() + withinDays * 86_400_000);
    return this.extractionRepo.find({
      where: { workspaceId, renewalDate: LessThan(cutoff) },
      order: { renewalDate: 'ASC' },
    });
  }

  async getHighRiskContracts(workspaceId: string): Promise<ContractExtractionEntity[]> {
    const all = await this.extractionRepo.find({ where: { workspaceId } });
    return all.filter((c) => c.riskFlags?.length > 0);
  }

  async getExtractionsByAccount(workspaceId: string, accountId: string): Promise<ContractExtractionEntity[]> {
    return this.extractionRepo.find({ where: { workspaceId, accountId }, order: { createdAt: 'DESC' } });
  }

  async getStats(id: string, workspaceId: string): Promise<Record<string, number>> {
    const agent = await this.agentRepo.findOne({ where: { id, workspaceId } });
    if (!agent) return { contractsProcessed: 0, renewalsDetected: 0, risksIdentified: 0 };
    return {
      contractsProcessed: agent.contractsProcessed,
      renewalsDetected: agent.renewalsDetected,
      risksIdentified: agent.risksIdentified,
    };
  }
}
