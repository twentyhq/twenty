import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type UpgradeMigrationStatus = 'completed' | 'failed';

@Entity({ name: 'upgradeMigration', schema: 'core' })
@Unique('UQ_upgrade_migration_name_retry', ['name', 'retry'])
export class UpgradeMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  status: UpgradeMigrationStatus;

  @Column({ type: 'integer', nullable: false, default: 0 })
  retry: number;

  @Column({ type: 'varchar', nullable: false })
  runByVersion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
