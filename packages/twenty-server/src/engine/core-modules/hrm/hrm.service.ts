import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmployeeEntity, RecruitmentCandidateEntity, PayrollRecordEntity,
  PerformanceReviewEntity, LeaveRequestEntity, EmployeeSatisfactionEntity,
  EmployeeStatus, RecruitmentStage,
} from './hrm.entity';

@Injectable()
export class HRMService {
  constructor(
    @InjectRepository(EmployeeEntity) private readonly empRepo: Repository<EmployeeEntity>,
    @InjectRepository(RecruitmentCandidateEntity) private readonly candidateRepo: Repository<RecruitmentCandidateEntity>,
    @InjectRepository(PayrollRecordEntity) private readonly payrollRepo: Repository<PayrollRecordEntity>,
    @InjectRepository(PerformanceReviewEntity) private readonly reviewRepo: Repository<PerformanceReviewEntity>,
    @InjectRepository(LeaveRequestEntity) private readonly leaveRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(EmployeeSatisfactionEntity) private readonly satisfactionRepo: Repository<EmployeeSatisfactionEntity>,
  ) {}

  // --- EMPLOYEES ---
  async createEmployee(workspaceId: string, data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    return this.empRepo.save(this.empRepo.create({ workspaceId, ...data }));
  }

  async getOrgChart(workspaceId: string): Promise<Array<{ id: string; name: string; position: string; department: string; managerId: string }>> {
    const emps = await this.empRepo.find({ where: { workspaceId, status: EmployeeStatus.ACTIVE } });
    return emps.map((e) => ({ id: e.id, name: e.fullName, position: e.position, department: e.department, managerId: e.managerId }));
  }

  async terminateEmployee(employeeId: string): Promise<EmployeeEntity> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);
    emp.status = EmployeeStatus.TERMINATED;
    emp.terminationDate = new Date();
    return this.empRepo.save(emp);
  }

  async getSkillMatrix(workspaceId: string): Promise<Array<{ id: string; name: string; skills: string[] }>> {
    const emps = await this.empRepo.find({ where: { workspaceId, status: EmployeeStatus.ACTIVE } });
    return emps.filter((e) => e.skills?.length).map((e) => ({ id: e.id, name: e.fullName, skills: e.skills }));
  }

  // --- RECRUITMENT ---
  async createCandidate(workspaceId: string, data: Partial<RecruitmentCandidateEntity>): Promise<RecruitmentCandidateEntity> {
    return this.candidateRepo.save(this.candidateRepo.create({ workspaceId, ...data }));
  }

  async advanceCandidate(candidateId: string, stage: RecruitmentStage): Promise<RecruitmentCandidateEntity> {
    await this.candidateRepo.update(candidateId, { stage });
    const c = await this.candidateRepo.findOne({ where: { id: candidateId } });
    if (!c) throw new NotFoundException(`Candidate ${candidateId} not found`);
    return c;
  }

  async hireCandidate(workspaceId: string, candidateId: string, salary: number): Promise<EmployeeEntity> {
    const candidate = await this.candidateRepo.findOne({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException(`Candidate ${candidateId} not found`);
    candidate.stage = RecruitmentStage.HIRED;
    await this.candidateRepo.save(candidate);
    return this.createEmployee(workspaceId, {
      fullName: candidate.fullName, email: candidate.email,
      position: candidate.position, baseSalary: salary,
      status: EmployeeStatus.ONBOARDING, hireDate: new Date(),
    });
  }

  // --- PAYROLL ---
  async calculatePayroll(workspaceId: string, employeeId: string, period: string, extras: { overtime?: number; commissions?: number; bonuses?: number } = {}): Promise<PayrollRecordEntity> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);
    const base = Number(emp.baseSalary);
    const gross = base + (extras.overtime ?? 0) + (extras.commissions ?? 0) + (extras.bonuses ?? 0);
    const health = gross * 0.04;
    const pension = gross * 0.04;
    const tax = gross > 4_500_000 ? gross * 0.07 : 0;
    const net = gross - health - pension - tax;
    return this.payrollRepo.save(this.payrollRepo.create({
      workspaceId, employeeId, period, baseSalary: base,
      overtime: extras.overtime ?? 0, commissions: extras.commissions ?? 0, bonuses: extras.bonuses ?? 0,
      healthDeduction: health, pensionDeduction: pension, taxWithholding: tax, netPay: net,
    }));
  }

  // --- PERFORMANCE ---
  async createReview(workspaceId: string, data: Partial<PerformanceReviewEntity>): Promise<PerformanceReviewEntity> {
    return this.reviewRepo.save(this.reviewRepo.create({ workspaceId, ...data }));
  }

  // --- LEAVES ---
  async requestLeave(workspaceId: string, data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRepo.save(this.leaveRepo.create({ workspaceId, ...data }));
  }

  async approveLeave(leaveId: string, approverId: string): Promise<LeaveRequestEntity> {
    const leave = await this.leaveRepo.findOne({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException(`Leave ${leaveId} not found`);
    leave.status = 'approved';
    leave.approverId = approverId;
    await this.empRepo.increment({ id: leave.employeeId }, 'vacationDaysUsed', leave.days);
    return this.leaveRepo.save(leave);
  }

  // --- SATISFACTION ---
  async recordSatisfaction(workspaceId: string, employeeId: string, score: number, feedback?: string): Promise<EmployeeSatisfactionEntity> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId } });
    return this.satisfactionRepo.save(this.satisfactionRepo.create({
      workspaceId, employeeId, score, feedback, department: emp?.department,
    }));
  }

  async getENPS(workspaceId: string): Promise<{ enps: number; promoters: number; detractors: number }> {
    const surveys = await this.satisfactionRepo.find({ where: { workspaceId } });
    if (!surveys.length) return { enps: 0, promoters: 0, detractors: 0 };
    const promoters = surveys.filter((s) => s.score >= 9).length;
    const detractors = surveys.filter((s) => s.score <= 6).length;
    return { enps: Math.round(((promoters - detractors) / surveys.length) * 100), promoters, detractors };
  }

  // --- ANALYTICS ---
  async getWorkforceAnalytics(workspaceId: string): Promise<{ headcount: number; avgSalary: number; turnoverRate: number; payrollCost: number }> {
    const active = await this.empRepo.find({ where: { workspaceId, status: EmployeeStatus.ACTIVE } });
    const terminated = await this.empRepo.count({ where: { workspaceId, status: EmployeeStatus.TERMINATED } });
    const total = active.length + terminated;
    const avgSalary = active.length ? active.reduce((s, e) => s + Number(e.baseSalary), 0) / active.length : 0;
    return {
      headcount: active.length,
      avgSalary: Math.round(avgSalary),
      turnoverRate: total ? Math.round((terminated / total) * 100) : 0,
      payrollCost: active.reduce((s, e) => s + Number(e.baseSalary), 0),
    };
  }
}
