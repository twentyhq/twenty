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

  // --- ONBOARDING ---
  async generateOnboardingChecklist(
    workspaceId: string,
    employeeId: string,
  ): Promise<Array<{ task: string; category: string; completed: boolean; dueOffset: number }>> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId, workspaceId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);

    const checklist = [
      { task: 'IT setup - laptop, email, and accounts provisioning', category: 'IT', completed: false, dueOffset: 0 },
      { task: 'Access permissions - grant role-based system access', category: 'IT', completed: false, dueOffset: 1 },
      { task: 'Welcome meeting with manager and team', category: 'Culture', completed: false, dueOffset: 1 },
      { task: 'Policy acknowledgment - company handbook and compliance', category: 'Compliance', completed: false, dueOffset: 3 },
      { task: 'Training enrollment - role-specific onboarding courses', category: 'Training', completed: false, dueOffset: 5 },
    ];

    return checklist;
  }

  // --- OVERTIME ---
  async calculateOvertime(
    workspaceId: string,
    employeeId: string,
    period: string,
  ): Promise<{ regularHours: number; overtimeHours: number; overtimeAmount: number }> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId, workspaceId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);

    const payrollRecords = await this.payrollRepo.find({ where: { workspaceId, employeeId, period } });
    const totalOvertimeLogged = payrollRecords.reduce((sum, r) => sum + Number(r.overtime), 0);

    // Standard: 8h/day, 48h/week = ~192h/month regular
    const standardMonthlyHours = 192;
    const hourlyRate = Number(emp.baseSalary) / standardMonthlyHours;
    const overtimeMultiplier = 1.25;

    const overtimeHours = totalOvertimeLogged > 0
      ? totalOvertimeLogged / (hourlyRate * overtimeMultiplier) || 0
      : 0;

    const regularHours = standardMonthlyHours;
    const overtimeAmount = Number(totalOvertimeLogged);

    return {
      regularHours,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      overtimeAmount: Math.round(overtimeAmount * 100) / 100,
    };
  }

  // --- PAYSLIP ---
  async generatePayslip(
    workspaceId: string,
    employeeId: string,
    period: string,
  ): Promise<{
    employeeId: string;
    employeeName: string;
    period: string;
    baseSalary: number;
    overtime: number;
    commissions: number;
    bonuses: number;
    grossPay: number;
    deductions: {
      health: number;
      pension: number;
      tax: number;
      other: number;
      totalDeductions: number;
    };
    netPay: number;
  }> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId, workspaceId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);

    const record = await this.payrollRepo.findOne({ where: { workspaceId, employeeId, period } });
    if (!record) throw new NotFoundException(`No payroll record found for employee ${employeeId} in period ${period}`);

    const grossPay = Number(record.baseSalary) + Number(record.overtime) + Number(record.commissions) + Number(record.bonuses);
    const totalDeductions = Number(record.healthDeduction) + Number(record.pensionDeduction) + Number(record.taxWithholding) + Number(record.otherDeductions);

    return {
      employeeId,
      employeeName: emp.fullName,
      period,
      baseSalary: Number(record.baseSalary),
      overtime: Number(record.overtime),
      commissions: Number(record.commissions),
      bonuses: Number(record.bonuses),
      grossPay,
      deductions: {
        health: Number(record.healthDeduction),
        pension: Number(record.pensionDeduction),
        tax: Number(record.taxWithholding),
        other: Number(record.otherDeductions),
        totalDeductions,
      },
      netPay: Number(record.netPay),
    };
  }

  // --- COMPENSATION HISTORY ---
  async getCompensationHistory(
    workspaceId: string,
    employeeId: string,
  ): Promise<Array<{ period: string; baseSalary: number; grossPay: number; netPay: number; createdAt: Date }>> {
    const emp = await this.empRepo.findOne({ where: { id: employeeId, workspaceId } });
    if (!emp) throw new NotFoundException(`Employee ${employeeId} not found`);

    const records = await this.payrollRepo.find({
      where: { workspaceId, employeeId },
      order: { createdAt: 'ASC' },
    });

    return records.map((r) => ({
      period: r.period,
      baseSalary: Number(r.baseSalary),
      grossPay: Number(r.baseSalary) + Number(r.overtime) + Number(r.commissions) + Number(r.bonuses),
      netPay: Number(r.netPay),
      createdAt: r.createdAt,
    }));
  }

  // --- TURNOVER ---
  async calculateTurnover(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ turnoverRate: number; terminatedCount: number; avgHeadcount: number }> {
    const allEmployees = await this.empRepo.find({ where: { workspaceId } });

    const activeAtStart = allEmployees.filter(
      (e) => e.hireDate && new Date(e.hireDate) <= startDate &&
        (e.status !== EmployeeStatus.TERMINATED || (e.terminationDate && new Date(e.terminationDate) > startDate)),
    ).length;

    const activeAtEnd = allEmployees.filter(
      (e) => e.hireDate && new Date(e.hireDate) <= endDate &&
        (e.status !== EmployeeStatus.TERMINATED || (e.terminationDate && new Date(e.terminationDate) > endDate)),
    ).length;

    const avgHeadcount = (activeAtStart + activeAtEnd) / 2;

    const terminatedInPeriod = allEmployees.filter(
      (e) => e.status === EmployeeStatus.TERMINATED &&
        e.terminationDate && new Date(e.terminationDate) >= startDate && new Date(e.terminationDate) <= endDate,
    ).length;

    const turnoverRate = avgHeadcount > 0
      ? Math.round((terminatedInPeriod / avgHeadcount) * 100 * 100) / 100
      : 0;

    return { turnoverRate, terminatedCount: terminatedInPeriod, avgHeadcount: Math.round(avgHeadcount) };
  }

  // --- HEADCOUNT BY DEPARTMENT ---
  async getHeadcountByDepartment(
    workspaceId: string,
  ): Promise<Array<{ department: string; count: number; avgSalary: number }>> {
    const activeEmployees = await this.empRepo.find({ where: { workspaceId, status: EmployeeStatus.ACTIVE } });

    const deptMap = new Map<string, { count: number; totalSalary: number }>();
    for (const emp of activeEmployees) {
      const dept = emp.department ?? 'Unassigned';
      const existing = deptMap.get(dept) ?? { count: 0, totalSalary: 0 };
      existing.count++;
      existing.totalSalary += Number(emp.baseSalary);
      deptMap.set(dept, existing);
    }

    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      count: data.count,
      avgSalary: Math.round(data.totalSalary / data.count),
    })).sort((a, b) => b.count - a.count);
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
