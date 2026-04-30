import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EmployeeStatus { ACTIVE = 'active', ON_LEAVE = 'on_leave', TERMINATED = 'terminated', ONBOARDING = 'onboarding' }
export enum RecruitmentStage { APPLICATION = 'application', SCREENING = 'screening', INTERVIEW = 'interview', OFFER = 'offer', HIRED = 'hired', REJECTED = 'rejected' }

@Entity('employee')
@Index(['workspaceId', 'status'])
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) fullName: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) phone: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) position: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) department: string;
  @Column({ nullable: true }) managerId: string;
  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE }) status: EmployeeStatus;
  @Column({ type: 'date', nullable: true }) hireDate: Date;
  @Column({ type: 'date', nullable: true }) terminationDate: Date;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) baseSalary: number;
  @Column({ type: 'varchar', length: 3, default: 'COP' }) currency: string;
  @Column({ type: 'simple-json', nullable: true }) skills: string[];
  @Column({ type: 'simple-json', nullable: true }) benefits: Record<string, unknown>;
  @Column({ type: 'int', default: 15 }) vacationDaysTotal: number;
  @Column({ type: 'int', default: 0 }) vacationDaysUsed: number;
  @Column({ type: 'simple-json', nullable: true }) documents: Array<{ name: string; fileId: string; expiryDate?: string }>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('recruitment_candidate')
@Index(['workspaceId', 'stage'])
export class RecruitmentCandidateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) fullName: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) position: string;
  @Column({ type: 'enum', enum: RecruitmentStage, default: RecruitmentStage.APPLICATION }) stage: RecruitmentStage;
  @Column({ type: 'text', nullable: true }) resumeFileId: string;
  @Column({ type: 'float', nullable: true }) rating: number;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ nullable: true }) referredBy: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('payroll_record')
@Index(['workspaceId', 'employeeId', 'period'])
export class PayrollRecordEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ type: 'varchar', length: 20, nullable: false }) period: string;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) baseSalary: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) overtime: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) commissions: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) bonuses: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) healthDeduction: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) pensionDeduction: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) taxWithholding: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) otherDeductions: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) netPay: number;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('performance_review')
@Index(['workspaceId', 'employeeId'])
export class PerformanceReviewEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ nullable: true }) reviewerId: string;
  @Column({ type: 'varchar', length: 20, nullable: false }) cycle: string;
  @Column({ type: 'varchar', length: 20, default: 'manager' }) type: string;
  @Column({ type: 'float', nullable: true }) overallRating: number;
  @Column({ type: 'simple-json', nullable: true }) competencies: Array<{ name: string; rating: number; comment: string }>;
  @Column({ type: 'text', nullable: true }) strengths: string;
  @Column({ type: 'text', nullable: true }) improvements: string;
  @Column({ type: 'simple-json', nullable: true }) goals: Array<{ title: string; target: string; progress: number }>;
  @CreateDateColumn() createdAt: Date;
}

@Entity('leave_request')
@Index(['workspaceId', 'employeeId'])
export class LeaveRequestEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ type: 'varchar', length: 50, default: 'vacation' }) type: string;
  @Column({ type: 'date', nullable: false }) startDate: Date;
  @Column({ type: 'date', nullable: false }) endDate: Date;
  @Column({ type: 'int', nullable: false }) days: number;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  @Column({ nullable: true }) approverId: string;
  @Column({ type: 'text', nullable: true }) reason: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('employee_satisfaction')
@Index(['workspaceId'])
export class EmployeeSatisfactionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) employeeId: string;
  @Column({ type: 'int', nullable: false }) score: number;
  @Column({ type: 'text', nullable: true }) feedback: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) department: string;
  @CreateDateColumn() createdAt: Date;
}
