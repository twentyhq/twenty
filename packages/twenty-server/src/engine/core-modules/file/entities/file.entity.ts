import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity('file')
@Index('IDX_FILE_WORKSPACE_ID', ['workspaceId'])
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  fullPath: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
