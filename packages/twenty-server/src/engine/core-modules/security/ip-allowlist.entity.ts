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

export enum IPRuleType {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum IPRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('ip_allowlist')
export class IPAllowlistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  ipAddress: string;

  @Column({ nullable: true })
  ipRange: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: IPRuleType,
    default: IPRuleType.ALLOW,
  })
  ruleType: IPRuleType;

  @Column({
    type: 'enum',
    enum: IPRuleStatus,
    default: IPRuleStatus.ACTIVE,
  })
  status: IPRuleStatus;

  @Column({ type: 'boolean', default: false })
  isGlobal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
