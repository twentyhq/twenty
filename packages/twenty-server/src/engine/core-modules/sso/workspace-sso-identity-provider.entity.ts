/* @license Enterprise */

import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

export enum IdentityProviderType {
  Oidc = 'Oidc',
  Saml = 'Saml',
}

export enum OidcResponseType {
  // Only Authorization Code is used for now
  CODE = 'code',
  ID_TOKEN = 'id_token',
  TOKEN = 'token',
  NONE = 'none',
}

registerEnumType(IdentityProviderType, {
  name: 'IdentityProviderType',
});

export enum SsoIdentityProviderStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Error = 'Error',
}

registerEnumType(SsoIdentityProviderStatus, {
  name: 'SsoIdentityProviderStatus',
});

@Entity({ name: 'workspaceSsoIdentityProvider', schema: 'core' })
@ObjectType('WorkspaceSsoIdentityProvider')
export class WorkspaceSsoIdentityProviderEntity extends WorkspaceRelatedEntity {
  // COMMON
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SsoIdentityProviderStatus,
    default: SsoIdentityProviderStatus.Active,
  })
  status: SsoIdentityProviderStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: IdentityProviderType,
    default: IdentityProviderType.Oidc,
  })
  type: IdentityProviderType;

  @Column()
  issuer: string;

  // Oidc
  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  clientSecret?: string;

  // Saml
  @Column({ nullable: true })
  ssoUrl?: string;

  @Column({ nullable: true })
  certificate?: string;

  @Column({ nullable: true })
  fingerprint?: string;
}
