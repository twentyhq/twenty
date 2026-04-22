import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum MCPServerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('mcp_server')
export class MCPServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  apiKey: string;

  @Column({
    type: 'enum',
    enum: MCPServerStatus,
    default: MCPServerStatus.ACTIVE,
  })
  status: MCPServerStatus;

  @Column({ type: 'simple-array', nullable: true })
  allowedObjects: string[];

  @Column({ type: 'simple-array', nullable: true })
  allowedOperations: string[];

  @Column({ type: 'int', default: 100 })
  rateLimitPerMinute: number;

  @Column({ type: 'boolean', default: true })
  allowCreate: boolean;

  @Column({ type: 'boolean', default: true })
  allowRead: boolean;

  @Column({ type: 'boolean', default: false })
  allowUpdate: boolean;

  @Column({ type: 'boolean', default: false })
  allowDelete: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
