import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskDependencyType {
  FINISH_TO_START = 'finish_to_start',
  START_TO_START = 'start_to_start',
  FINISH_TO_FINISH = 'finish_to_finish',
}

export enum RACIRole {
  RESPONSIBLE = 'R',
  ACCOUNTABLE = 'A',
  CONSULTED = 'C',
  INFORMED = 'I',
}

@Entity('project')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'dealId'])
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: true })
  dealId: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  templateId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  methodology: string;

  @Column({ nullable: true })
  managerId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'float', default: 0 })
  progressPercent: number;

  @Column({ type: 'float', nullable: true })
  healthScore: number;

  @Column({ type: 'varchar', length: 10, default: 'green' })
  healthColor: string;

  @Column({ type: 'boolean', default: false })
  isRetainer: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retainerHoursTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retainerHoursUsed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('project_task')
@Index(['projectId', 'status'])
export class ProjectTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  projectId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'todo' })
  status: string;

  @Column({ nullable: true })
  assigneeId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phase: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'int', default: 0 })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loggedHours: number;

  @Column({ type: 'boolean', default: true })
  isBillable: boolean;

  @Column({ type: 'simple-json', nullable: true })
  dependencies: Array<{ taskId: string; type: TaskDependencyType }>;

  @Column({ type: 'simple-json', nullable: true })
  raci: Array<{ userId: string; role: RACIRole }>;

  @Column({ type: 'boolean', default: false })
  isMilestone: boolean;

  @Column({ type: 'boolean', default: false })
  notifyClientOnComplete: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('time_entry')
@Index(['projectId', 'userId'])
export class TimeEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  projectId: string;

  @Column({ nullable: true })
  taskId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  hours: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isBillable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('project_risk')
@Index(['projectId'])
export class ProjectRiskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  projectId: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  probability: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  impact: string;

  @Column({ type: 'text', nullable: true })
  mitigationPlan: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('project_template')
@Index(['workspaceId'])
export class ProjectTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  methodology: string;

  @Column({ type: 'simple-json', nullable: true })
  phases: Array<{ name: string; tasks: Array<{ name: string; estimatedHours: number; isMilestone: boolean }> }>;

  @CreateDateColumn()
  createdAt: Date;
}
