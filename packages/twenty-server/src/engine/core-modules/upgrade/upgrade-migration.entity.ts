import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type UpgradeMigrationStatus = 'completed' | 'failed';

@Entity({ name: 'upgradeMigration', schema: 'core' })
@Index('UQ_upgrade_migration_instance', ['name', 'attempt'], {
  unique: true,
  where: '"workspaceId" IS NULL',
})
@Index('UQ_upgrade_migration_workspace', ['name', 'attempt', 'workspaceId'], {
  unique: true,
  where: '"workspaceId" IS NOT NULL',
})
export class UpgradeMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  status: UpgradeMigrationStatus;

  @Column({ type: 'integer', nullable: false, default: 1 })
  attempt: number;

  @Column({ type: 'varchar', nullable: false })
  executedByVersion: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity> | null;

  @Column({ type: 'uuid', nullable: true })
  workspaceId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
