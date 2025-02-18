/* @license Enterprise */

import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BaseEntity } from 'src/engine/utils/base-entities-fields';

export enum IdentityProviderType {
  OIDC = 'OIDC',
  SAML = 'SAML',
}

export enum OIDCResponseType {
  // Only Authorization Code is used for now
  CODE = 'code',
  ID_TOKEN = 'id_token',
  TOKEN = 'token',
  NONE = 'none',
}

registerEnumType(IdentityProviderType, {
  name: 'IdentityProviderType',
});

export enum SSOIdentityProviderStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Error = 'Error',
}

registerEnumType(SSOIdentityProviderStatus, {
  name: 'SSOIdentityProviderStatus',
});

@Entity({ name: 'workspaceSSOIdentityProvider', schema: 'core' })
@ObjectType()
export class WorkspaceSSOIdentityProvider extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SSOIdentityProviderStatus,
    default: SSOIdentityProviderStatus.Active,
  })
  status: SSOIdentityProviderStatus;

  @ManyToOne(
    () => Workspace,
    (workspace) => workspace.workspaceSSOIdentityProviders,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column()
  workspaceId: string;

  @Column({
    type: 'enum',
    enum: IdentityProviderType,
    default: IdentityProviderType.OIDC,
  })
  type: IdentityProviderType;

  @Column()
  issuer: string;

  // OIDC
  @Column({ nullable: true })
  clientID?: string;

  @Column({ nullable: true })
  clientSecret?: string;

  // SAML
  @Column({ nullable: true })
  ssoURL?: string;

  @Column({ nullable: true })
  certificate?: string;

  @Column({ nullable: true })
  fingerprint?: string;
}
