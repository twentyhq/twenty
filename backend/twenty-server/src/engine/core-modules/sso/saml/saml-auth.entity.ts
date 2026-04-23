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

export enum SsoIdentityProviderType {
  OKTA = 'okta',
  AZURE_AD = 'azure_ad',
  ONELOGIN = 'onelogin',
  PING_IDENTITY = 'ping_identity',
  GENERIC_SAML = 'generic_saml',
}

@Entity('saml_identity_provider')
export class SamlIdentityProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: SsoIdentityProviderType,
    default: SsoIdentityProviderType.GENERIC_SAML,
  })
  providerType: SsoIdentityProviderType;

  @Column({ nullable: false })
  entryPointUrl: string;

  @Column({ nullable: false })
  issuer: string;

  @Column({ type: 'text', nullable: true })
  certificate: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', nullable: true })
  attributeMappingEmail: string;

  @Column({ type: 'varchar', nullable: true })
  attributeMappingFirstName: string;

  @Column({ type: 'varchar', nullable: true })
  attributeMappingLastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
