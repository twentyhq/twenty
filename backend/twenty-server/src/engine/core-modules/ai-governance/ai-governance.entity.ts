import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AIProvider { OPENAI = 'openai', ANTHROPIC = 'anthropic', GOOGLE = 'google', AZURE = 'azure', LOCAL = 'local', CUSTOM = 'custom' }
export enum MaskingStrategy { REDACT = 'redact', HASH = 'hash', REPLACE = 'replace', TOKENIZE = 'tokenize' }
export enum PIICategory { EMAIL = 'email', PHONE = 'phone', SSN = 'ssn', CREDIT_CARD = 'credit_card', ADDRESS = 'address', NAME = 'name', ID_NUMBER = 'id_number', CUSTOM = 'custom' }
export enum AuditAction { PROMPT = 'prompt', COMPLETION = 'completion', PII_DETECTED = 'pii_detected', PII_MASKED = 'pii_masked', POLICY_VIOLATION = 'policy_violation', MODEL_SWITCH = 'model_switch' }

@Entity('ai_usage_log')
@Index(['workspaceId'])
@Index(['workspaceId', 'provider'])
export class AIUsageLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: AIProvider, default: AIProvider.OPENAI }) provider: AIProvider;
  @Column({ type: 'varchar', length: 100, nullable: false }) model: string;
  @Column({ type: 'int', default: 0 }) inputTokens: number;
  @Column({ type: 'int', default: 0 }) outputTokens: number;
  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 }) cost: number;
  @Column({ type: 'int', nullable: true }) latencyMs: number;
  @Column({ type: 'varchar', length: 255, nullable: true }) feature: string;
  @Column({ type: 'boolean', default: false }) piiDetected: boolean;
  @Column({ type: 'boolean', default: false }) piiMasked: boolean;
  @Column({ type: 'boolean', default: true }) success: boolean;
  @Column({ type: 'text', nullable: true }) errorMessage: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('pii_masking_rule')
@Index(['workspaceId'])
export class PIIMaskingRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'enum', enum: PIICategory, default: PIICategory.EMAIL }) category: PIICategory;
  @Column({ type: 'text', nullable: false }) pattern: string;
  @Column({ type: 'enum', enum: MaskingStrategy, default: MaskingStrategy.REDACT }) strategy: MaskingStrategy;
  @Column({ type: 'varchar', length: 255, nullable: true }) replacement: string;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'int', default: 0 }) priority: number;
  @Column({ type: 'int', default: 0 }) matchCount: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('ai_model_config')
@Index(['workspaceId'])
export class ModelConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'enum', enum: AIProvider, default: AIProvider.OPENAI }) provider: AIProvider;
  @Column({ type: 'varchar', length: 100, nullable: false }) modelId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) displayName: string;
  @Column({ type: 'boolean', default: true }) isEnabled: boolean;
  @Column({ type: 'int', nullable: true }) maxTokens: number;
  @Column({ type: 'float', nullable: true }) temperature: number;
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }) costPerInputToken: number;
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }) costPerOutputToken: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true }) monthlyBudget: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) monthlySpend: number;
  @Column({ type: 'int', nullable: true }) rateLimitPerMinute: number;
  @Column({ type: 'simple-json', nullable: true }) allowedFeatures: string[];
  @Column({ type: 'varchar', length: 512, nullable: true }) apiKey: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('prompt_template')
@Index(['workspaceId'])
export class PromptTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: false }) template: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) version: string;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'simple-json', nullable: true }) variables: string[];
  @Column({ type: 'simple-json', nullable: true }) requiredPIIMasking: PIICategory[];
  @Column({ type: 'int', default: 0 }) usageCount: number;
  @Column({ type: 'float', nullable: true }) avgLatencyMs: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('ai_audit_entry')
@Index(['workspaceId'])
@Index(['workspaceId', 'action'])
export class AIAuditEntryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: AuditAction, default: AuditAction.PROMPT }) action: AuditAction;
  @Column({ type: 'varchar', length: 255, nullable: true }) resource: string;
  @Column({ type: 'text', nullable: true }) details: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) ipAddress: string;
  @Column({ type: 'boolean', default: false }) isFlagged: boolean;
  @Column({ type: 'varchar', length: 255, nullable: true }) policyViolation: string;
  @Column({ nullable: true }) relatedLogId: string;
  @CreateDateColumn() createdAt: Date;
}
