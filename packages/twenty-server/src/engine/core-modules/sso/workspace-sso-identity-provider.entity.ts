/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
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
  OIDC = 'OIDC',
  SAML = 'SAML',
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
  name: 'SSOIdentityProviderStatus',
});

@Entity({ name: 'workspaceSSOIdentityProvider', schema: 'core' })
@ObjectType('WorkspaceSSOIdentityProvider')
export class WorkspaceSsoIdentityProviderEntity extends WorkspaceRelatedEntity {
  // COMMON
  @Field(() => UUIDScalarType)
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
