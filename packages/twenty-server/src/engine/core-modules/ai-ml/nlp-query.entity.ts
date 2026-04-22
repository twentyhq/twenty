import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum QueryStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

@Entity('nlp_query_config')
@Index(['workspaceId'])
export class NLPQueryConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  supportedLanguages: string[];

  @Column({ type: 'int', default: 100 })
  maxResults: number;

  @Column({ type: 'boolean', default: true })
  fuzzyMatching: boolean;

  @Column({ type: 'int', default: 3 })
  fuzzyThreshold: number;

  @Column({ type: 'simple-json', nullable: true })
  entityMappings: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('nlp_query_log')
@Index(['workspaceId', 'createdAt'])
export class NLPQueryLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'text', nullable: false })
  naturalQuery: string;

  @Column({ type: 'text', nullable: true })
  generatedSql: string;

  @Column({ type: 'simple-json', nullable: true })
  parsedFilters: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  resultsCount: number;

  @Column({ type: 'float', nullable: true })
  processingTimeMs: number;

  @Column({ type: 'enum', enum: QueryStatus, default: QueryStatus.SUCCESS })
  status: QueryStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
