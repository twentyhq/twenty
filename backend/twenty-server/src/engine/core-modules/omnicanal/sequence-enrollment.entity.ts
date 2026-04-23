import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  REPLIED = 'replied',
  BOUNCED = 'bounced',
}

@Index(['workspaceId', 'sequenceId'])
@Index(['workspaceId', 'contactId'])
@Entity('sequence_enrollment')
export class SequenceEnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  sequenceId: string;

  @Column({ nullable: false })
  contactId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ type: 'int', default: 0 })
  currentStepOrder: number;

  @Column({ nullable: true })
  currentStepId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  nextActionAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActionAt: Date | null;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  emailsSent: number;

  @Column({ type: 'int', default: 0 })
  emailsOpened: number;

  @Column({ type: 'int', default: 0 })
  emailsClicked: number;

  @Column({ type: 'int', default: 0 })
  smsSent: number;

  @Column({ type: 'int', default: 0 })
  tasksCreated: number;

  @Column({ type: 'int', default: 0 })
  replies: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown>;
}
