import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CLMContractEntity, CLMTemplateEntity, ContractStatus, ApprovalStatus } from './contract-lifecycle.entity';

@Injectable()
export class ContractLifecycleService {
  constructor(
    @InjectRepository(CLMContractEntity) private readonly contractRepo: Repository<CLMContractEntity>,
    @InjectRepository(CLMTemplateEntity) private readonly templateRepo: Repository<CLMTemplateEntity>,
  ) {}

  async createFromDeal(workspaceId: string, dealId: string, templateId: string, data: Partial<CLMContractEntity>): Promise<CLMContractEntity> {
    const template = await this.templateRepo.findOne({ where: { id: templateId } });
    let content = template?.content ?? '';
    if (template?.variables) {
      for (const v of template.variables) {
        content = content.replace(`{{${v}}}`, (data as Record<string, unknown>)[v] as string ?? '');
      }
    }
    return this.contractRepo.save(this.contractRepo.create({ workspaceId, dealId, templateId, content, ...data }));
  }

  async submitForApproval(contractId: string, chain: Array<{ role: string; userId: string }>): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    c.status = ContractStatus.IN_REVIEW;
    c.approvalChain = chain.map((a) => ({ ...a, status: ApprovalStatus.PENDING }));
    return this.contractRepo.save(c);
  }

  async approveStep(contractId: string, userId: string): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    const step = c.approvalChain?.find((a) => a.userId === userId && a.status === ApprovalStatus.PENDING);
    if (step) { step.status = ApprovalStatus.APPROVED; step.date = new Date().toISOString(); }
    const allApproved = c.approvalChain?.every((a) => a.status === ApprovalStatus.APPROVED);
    if (allApproved) c.status = ContractStatus.PENDING_SIGNATURE;
    return this.contractRepo.save(c);
  }

  async addRedline(contractId: string, userId: string, change: string): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    c.status = ContractStatus.NEGOTIATION;
    const history = c.redlineHistory ?? [];
    history.push({ userId, change, timestamp: new Date().toISOString() });
    c.redlineHistory = history;
    c.version++;
    return this.contractRepo.save(c);
  }

  async signContract(contractId: string, signerId: string, ip: string): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    const audit = c.signatureAudit ?? [];
    audit.push({ signerId, ip, timestamp: new Date().toISOString(), hash: Buffer.from(`${contractId}:${signerId}:${Date.now()}`).toString('base64') });
    c.signatureAudit = audit;
    c.status = ContractStatus.ACTIVE;
    return this.contractRepo.save(c);
  }

  async getExpiringContracts(workspaceId: string, withinDays: number): Promise<CLMContractEntity[]> {
    const cutoff = new Date(Date.now() + withinDays * 86_400_000);
    return this.contractRepo.find({ where: { workspaceId, status: ContractStatus.ACTIVE, endDate: LessThan(cutoff) }, order: { endDate: 'ASC' } });
  }

  async scoreRisk(contractId: string): Promise<{ score: number; flags: string[] }> {
    const c = await this.findOrFail(contractId);
    const flags: string[] = [];
    let score = 0;
    if (c.autoRenew) { flags.push('auto_renew_risk'); score += 10; }
    if (c.slas?.some((s) => s.penalty)) { flags.push('penalty_clauses'); score += 20; }
    if (c.noticePeriodDays < 30) { flags.push('short_notice_period'); score += 15; }
    if (Number(c.totalValue) > 500_000_000) { flags.push('high_value'); score += 15; }
    c.riskScore = score; c.riskFlags = flags;
    await this.contractRepo.save(c);
    return { score, flags };
  }

  async createTemplate(workspaceId: string, data: Partial<CLMTemplateEntity>): Promise<CLMTemplateEntity> {
    return this.templateRepo.save(this.templateRepo.create({ workspaceId, ...data }));
  }

  async getAnalytics(workspaceId: string): Promise<{ active: number; expiring30: number; totalValue: number; avgRisk: number }> {
    const contracts = await this.contractRepo.find({ where: { workspaceId, status: ContractStatus.ACTIVE } });
    const now = Date.now();
    const expiring30 = contracts.filter((c) => c.endDate && new Date(c.endDate).getTime() - now < 30 * 86_400_000).length;
    const avgRisk = contracts.length ? contracts.reduce((s, c) => s + (c.riskScore ?? 0), 0) / contracts.length : 0;
    return { active: contracts.length, expiring30, totalValue: contracts.reduce((s, c) => s + Number(c.totalValue), 0), avgRisk: Math.round(avgRisk) };
  }

  // --- OBLIGATIONS ---
  async trackObligation(
    contractId: string,
    clause: string,
    responsible: string,
    dueDate: string,
  ): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    const obligations = c.obligations ?? [];
    obligations.push({ clause, responsible, dueDate, completed: false });
    c.obligations = obligations;
    return this.contractRepo.save(c);
  }

  async completeObligation(contractId: string, clauseIndex: number): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    if (!c.obligations || clauseIndex < 0 || clauseIndex >= c.obligations.length) {
      throw new NotFoundException(`Obligation at index ${clauseIndex} not found on contract ${contractId}`);
    }
    c.obligations[clauseIndex].completed = true;
    return this.contractRepo.save(c);
  }

  async getOverdueObligations(
    workspaceId: string,
  ): Promise<Array<{ contractId: string; title: string; clause: string; responsible: string; dueDate: string }>> {
    const contracts = await this.contractRepo.find({
      where: { workspaceId, status: ContractStatus.ACTIVE },
    });

    const now = new Date();
    const overdue: Array<{ contractId: string; title: string; clause: string; responsible: string; dueDate: string }> = [];

    for (const contract of contracts) {
      if (!contract.obligations) continue;
      for (const obligation of contract.obligations) {
        if (!obligation.completed && new Date(obligation.dueDate) < now) {
          overdue.push({
            contractId: contract.id,
            title: contract.title,
            clause: obligation.clause,
            responsible: obligation.responsible,
            dueDate: obligation.dueDate,
          });
        }
      }
    }

    return overdue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  // --- RENEWAL ---
  async renewContract(
    contractId: string,
    newEndDate: Date,
    adjustments?: Partial<Pick<CLMContractEntity, 'totalValue' | 'slas' | 'content'>>,
  ): Promise<CLMContractEntity> {
    const c = await this.findOrFail(contractId);
    c.endDate = newEndDate;
    c.version++;
    c.status = ContractStatus.ACTIVE;
    if (adjustments?.totalValue !== undefined) c.totalValue = adjustments.totalValue;
    if (adjustments?.slas !== undefined) c.slas = adjustments.slas;
    if (adjustments?.content !== undefined) c.content = adjustments.content;
    return this.contractRepo.save(c);
  }

  // --- QUERY BY ACCOUNT ---
  async getContractsByAccount(workspaceId: string, accountId: string): Promise<CLMContractEntity[]> {
    return this.contractRepo.find({
      where: { workspaceId, accountId },
      order: { createdAt: 'DESC' },
    });
  }

  private async findOrFail(id: string): Promise<CLMContractEntity> {
    const c = await this.contractRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException(`Contract ${id} not found`);
    return c;
  }
}
