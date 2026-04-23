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

export enum OidcIdentityProviderType {
  OKTA = 'okta',
  AZURE_AD = 'azure_ad',
  GOOGLE_WORKSPACE = 'google_workspace',
  AUTH0 = 'auth0',
  KEYCLOAK = 'keycloak',
  GENERIC_OIDC = 'generic_oidc',
}

@Entity('oidc_identity_provider')
export class OidcIdentityProviderEntity {
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
    enum: OidcIdentityProviderType,
    default: OidcIdentityProviderType.GENERIC_OIDC,
  })
  providerType: OidcIdentityProviderType;

  @Column({ nullable: false })
  issuerUrl: string;

  @Column({ nullable: false })
  authorizationUrl: string;

  @Column({ nullable: false })
  tokenUrl: string;

  @Column({ nullable: true })
  userInfoUrl: string;

  @Column({ type: 'text', nullable: true })
  jwksUri: string;

  @Column({ type: 'text', nullable: true })
  clientId: string;

  @Column({ type: 'text', nullable: true })
  clientSecret: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', nullable: true })
  claimMappingEmail: string;

  @Column({ type: 'varchar', nullable: true })
  claimMappingFirstName: string;

  @Column({ type: 'varchar', nullable: true })
  claimMappingLastName: string;

  @Column({ type: 'varchar', nullable: true })
  claimMappingPicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
