import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type UpgradeMigrationStatus = 'pending' | 'completed' | 'failed';

@Entity({ name: 'upgradeMigration', schema: 'core' })
@Unique('UQ_upgrade_migration_name', ['name'])
export class UpgradeMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  version: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
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
