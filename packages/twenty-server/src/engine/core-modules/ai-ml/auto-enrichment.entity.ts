import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum EnrichmentSource {
  CLEARBIT = 'clearbit',
  FULLHUNT = 'fullhunt',
  ZOOMINFO = 'zoominfo',
  LINKEDIN = 'linkedin',
  CUSTOM = 'custom',
}

export enum EnrichmentStatus {
  PENDING = 'pending',
  ENRICHING = 'enriching',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('auto_enrichment')
@Index(['workspaceId', 'recordId'])
export class AutoEnrichmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  enabledSources: EnrichmentSource[];

  @Column({ type: 'int', default: 24 })
  refreshIntervalHours: number;

  @Column({ type: 'int', default: 0 })
  recordsEnriched: number;

  @Column({ type: 'float', default: 0 })
  dataQualityScore: number;

  @Column({ type: 'simple-json', nullable: true })
  fieldMappings: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('enrichment_log')
@Index(['workspaceId', 'recordId', 'createdAt'])
export class EnrichmentLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  recordId: string;

  @Column({ nullable: false })
  recordType: string;

  @Column({ type: 'enum', enum: EnrichmentSource, nullable: false })
  source: EnrichmentSource;

  @Column({ type: 'simple-json', nullable: true })
  enrichedData: Record<string, unknown>;

  @Column({ type: 'enum', enum: EnrichmentStatus, default: EnrichmentStatus.COMPLETED })
  status: EnrichmentStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}