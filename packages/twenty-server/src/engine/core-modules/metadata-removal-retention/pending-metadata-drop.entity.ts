import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

export type PendingMetadataDropKind = 'COLUMN' | 'TABLE';

@Entity({ name: 'pendingMetadataDrop', schema: 'core' })
@Index('IDX_PENDING_METADATA_DROP_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_PENDING_METADATA_DROP_SCHEDULED_DROP_AT', ['scheduledDropAt'])
@Index('IDX_PENDING_METADATA_DROP_TARGET', [
  'workspaceId',
  'schemaName',
  'tableName',
])
export class PendingMetadataDropEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  kind: PendingMetadataDropKind;

  @Column({ type: 'varchar' })
  schemaName: string;

  @Column({ type: 'varchar' })
  tableName: string;

  @Column({ type: 'jsonb' })
  columnNames: string[];

  @Column({ type: 'jsonb' })
  enumNames: string[];

  @Column({ type: 'jsonb', nullable: true })
  columnDefinitions: WorkspaceSchemaColumnDefinition[] | null;

  @Column({ type: 'uuid', nullable: true })
  applicationId: string | null;

  @Column({ type: 'timestamptz' })
  removedAt: Date;

  @Column({ type: 'timestamptz' })
  scheduledDropAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'uuid' })
  workspaceId: string;
}
