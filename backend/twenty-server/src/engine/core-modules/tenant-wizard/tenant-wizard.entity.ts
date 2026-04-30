import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum StepStatus { PENDING = 'pending', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', SKIPPED = 'skipped', FAILED = 'failed' }
export enum IndustryType { TECHNOLOGY = 'technology', FINANCE = 'finance', HEALTHCARE = 'healthcare', RETAIL = 'retail', MANUFACTURING = 'manufacturing', SERVICES = 'services', EDUCATION = 'education', REAL_ESTATE = 'real_estate', OTHER = 'other' }
export enum ChecklistItemType { REQUIRED = 'required', OPTIONAL = 'optional', RECOMMENDED = 'recommended' }

@Entity('wizard_step')
@Index(['workspaceId'])
export class WizardStepEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'int', default: 0 }) order: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'enum', enum: StepStatus, default: StepStatus.PENDING }) status: StepStatus;
  @Column({ type: 'boolean', default: true }) isRequired: boolean;
  @Column({ type: 'varchar', length: 255, nullable: true }) componentKey: string;
  @Column({ type: 'simple-json', nullable: true }) config: Record<string, string | number | boolean>;
  @Column({ type: 'simple-json', nullable: true }) validationRules: Record<string, string>;
  @Column({ type: 'simple-json', nullable: true }) dependsOn: string[];
  @Column({ type: 'int', nullable: true }) estimatedMinutes: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('wizard_progress')
@Index(['workspaceId'])
export class WizardProgressEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'int', default: 0 }) currentStepOrder: number;
  @Column({ type: 'int', default: 0 }) totalSteps: number;
  @Column({ type: 'int', default: 0 }) completedSteps: number;
  @Column({ type: 'float', default: 0 }) progressPercent: number;
  @Column({ type: 'boolean', default: false }) isCompleted: boolean;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
  @Column({ type: 'simple-json', nullable: true }) stepResults: Record<string, Record<string, string | number | boolean>>;
  @Column({ type: 'varchar', length: 50, nullable: true }) selectedIndustry: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) selectedTemplate: string;
  @Column({ type: 'int', nullable: true }) estimatedTeamSize: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('industry_template')
@Index(['workspaceId'])
export class IndustryTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: IndustryType, default: IndustryType.OTHER }) industry: IndustryType;
  @Column({ type: 'simple-json', nullable: true }) modules: string[];
  @Column({ type: 'simple-json', nullable: true }) customFields: Array<{ object: string; field: string; type: string; label: string }>;
  @Column({ type: 'simple-json', nullable: true }) pipelines: Array<{ name: string; stages: string[] }>;
  @Column({ type: 'simple-json', nullable: true }) dashboards: string[];
  @Column({ type: 'simple-json', nullable: true }) automations: string[];
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'varchar', length: 500, nullable: true }) previewImageUrl: string;
  @Column({ type: 'int', default: 0 }) usageCount: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('onboarding_checklist')
@Index(['workspaceId'])
export class OnboardingChecklistEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: ChecklistItemType, default: ChecklistItemType.REQUIRED }) itemType: ChecklistItemType;
  @Column({ type: 'int', default: 0 }) order: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) actionUrl: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) actionLabel: string;
  @Column({ type: 'boolean', default: false }) isCompleted: boolean;
  @Column({ nullable: true }) completedBy: string;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
  @Column({ type: 'varchar', length: 255, nullable: true }) helpArticleUrl: string;
  @Column({ type: 'int', nullable: true }) estimatedMinutes: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
