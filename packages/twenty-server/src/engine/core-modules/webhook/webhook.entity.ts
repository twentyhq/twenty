import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'webhook', schema: 'core' })
export class WebhookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetUrl: string;

  @Column('simple-array')
  operations: string[];

  @Column({ nullable: true })
  description?: string;

  @Column()
  secret: string;

  @Column('uuid')
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}
