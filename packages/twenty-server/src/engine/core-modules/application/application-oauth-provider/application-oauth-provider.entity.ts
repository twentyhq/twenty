import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'applicationOAuthProvider', schema: 'core' })
@ObjectType('ApplicationOAuthProvider')
@Unique('IDX_APP_OAUTH_PROVIDER_NAME_APPLICATION_UNIQUE', [
  'name',
  'applicationId',
])
@Unique('IDX_APP_OAUTH_PROVIDER_UNIVERSAL_ID_APPLICATION_UNIQUE', [
  'universalIdentifier',
  'applicationId',
])
@Index('IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID', ['workspaceId'])
export class ApplicationOAuthProviderEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => ApplicationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;

  @Field()
  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Field()
  @Column({ nullable: false, type: 'varchar' })
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: false, type: 'varchar' })
  authorizationEndpoint: string;

  @Column({ nullable: false, type: 'varchar' })
  tokenEndpoint: string;

  @Column({ nullable: true, type: 'varchar' })
  revokeEndpoint: string | null;

  @Field(() => [String])
  @Column({ type: 'varchar', array: true, nullable: false, default: '{}' })
  scopes: string[];

  @Column({ nullable: false, type: 'varchar' })
  clientIdVariable: string;

  @Column({ nullable: false, type: 'varchar' })
  clientSecretVariable: string;

  @Column({ nullable: true, type: 'jsonb' })
  authorizationParams: Record<string, string> | null;

  @Column({ nullable: false, type: 'varchar', default: 'json' })
  tokenRequestContentType: OAuthProviderTokenRequestContentType;

  @Column({ nullable: false, type: 'boolean', default: true })
  usePkce: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
