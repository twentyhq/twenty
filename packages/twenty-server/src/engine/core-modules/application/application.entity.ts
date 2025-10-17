import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'application', schema: 'core' })
@Index('IDX_APPLICATION_WORKSPACE_ID', ['workspaceId'])
@Index(
  'IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE',
  ['universalIdentifier', 'workspaceId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL AND "universalIdentifier" IS NOT NULL',
  },
)
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  universalIdentifier?: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'text' })
  version: string | null;

  @Column({ type: 'text', default: 'local' })
  sourceType: 'local';

  @Column({ nullable: false, type: 'text' })
  sourcePath: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionLayerId: string;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
