import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmailTemplateType {
  COLD_OUTREACH = 'cold_outreach',
  FOLLOW_UP = 'follow_up',
  MEETING_REQUEST = 'meeting_request',
  PRODUCT_UPDATE = 'product_update',
  CASE_STUDY = 'case_study',
  CUSTOM = 'custom',
}

export enum EmailTone {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  CASUAL = 'casual',
  FORMAL = 'formal',
  PERSUASIVE = 'persuasive',
}

export enum EmailWriterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('ai_email_writer')
@Index(['workspaceId', 'status'])
export class AIEmailWriterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    default: EmailTemplateType.CUSTOM,
  })
  templateType: EmailTemplateType;

  @Column({
    type: 'enum',
    enum: EmailTone,
    default: EmailTone.PROFESSIONAL,
  })
  tone: EmailTone;

  @Column({ type: 'int', default: 150 })
  maxLength: number;

  @Column({ type: 'boolean', default: true })
  includeSignature: boolean;

  @Column({ type: 'boolean', default: false })
  includeCallToAction: boolean;

  @Column({ type: 'simple-array', nullable: true })
  variables: string[];

  @Column({
    type: 'enum',
    enum: EmailWriterStatus,
    default: EmailWriterStatus.ACTIVE,
  })
  status: EmailWriterStatus;

  @Column({ type: 'int', default: 0 })
  emailsGenerated: number;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('email_generation_log')
@Index(['workspaceId', 'createdAt'])
export class EmailGenerationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  contactId: string;

  @Column({ type: 'text', nullable: false })
  prompt: string;

  @Column({ type: 'text', nullable: false })
  generatedEmail: string;

  @Column({ type: 'text', nullable: true })
  subject: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    nullable: true,
  })
  templateType: EmailTemplateType;

  @Column({
    type: 'enum',
    enum: EmailTone,
    nullable: true,
  })
  tone: EmailTone;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
