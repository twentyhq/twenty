import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SequenceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DRAFT = 'draft',
}

export enum StepType {
  EMAIL = 'email',
  WAIT = 'wait',
  TASK = 'task',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
  CALL = 'call',
}

@Entity('email_sequence')
@Index(['workspaceId', 'status'])
export class EmailSequenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: SequenceStatus, default: SequenceStatus.DRAFT })
  status: SequenceStatus;

  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @Column({ type: 'int', default: 0 })
  replyCount: number;

  @Column({ type: 'float', default: 0 })
  replyRate: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('sequence_step')
@Index(['sequenceId', 'order'])
export class SequenceStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  sequenceId: string;

  @Column({ type: 'int', nullable: false })
  order: number;

  @Column({ type: 'enum', enum: StepType, nullable: false })
  type: StepType;

  @Column({ type: 'simple-json', nullable: true })
  config: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}