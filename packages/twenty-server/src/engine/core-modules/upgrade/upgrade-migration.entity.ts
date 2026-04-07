import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ type: 'varchar', nullable: true })
  workspaceId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
