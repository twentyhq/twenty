import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'postgresCredentials', schema: 'core' })
export class PostgresCredentials {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  user: string;

  @Column({ nullable: false })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.allPostgresCredentials, {
    onDelete: 'CASCADE',
  })
  workspace: Relation<Workspace>;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;
}
