import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'instanceMigration', schema: 'core' })
export class InstanceMigrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  version: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @Column({ type: 'integer', nullable: false, default: 0 })
  retry: number;

  @Column({ type: 'varchar', nullable: false })
  runByVersion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
