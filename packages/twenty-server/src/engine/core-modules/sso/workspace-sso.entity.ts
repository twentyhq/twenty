import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum SSOType {
  SAML = 'saml',
  OIDC = 'oidc',
}

export enum SSOStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Disabled = 'Disabled',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DISABLED = 'disabled',
}

@Entity('workspace_sso')
export class WorkspaceSSOEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity')
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({
    type: 'enum',
    enum: SSOType,
    nullable: false,
  })
  type: SSOType;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: SSOStatus,
    default: SSOStatus.PENDING,
  })
  status: SSOStatus;

  @Column({ nullable: true })
  issuer: string;

  @Column({ nullable: true })
  samlProviderId: string;

  @Column({ nullable: true })
  oidcProviderId: string;

  @Column({ type: 'boolean', default: false })
  enforceSso: boolean;

  @Column({ type: 'varchar', nullable: true })
  defaultRole: string;

  @Column({ type: 'boolean', default: false })
  allowPasswordLogin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
