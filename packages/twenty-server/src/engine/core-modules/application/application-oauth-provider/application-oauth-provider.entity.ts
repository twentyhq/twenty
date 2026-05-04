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

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'applicationOAuthProvider', schema: 'core' })
@Unique('IDX_APP_OAUTH_PROVIDER_NAME_APPLICATION_UNIQUE', [
  'name',
  'applicationId',
])
@Unique('IDX_APP_OAUTH_PROVIDER_UNIVERSAL_ID_APPLICATION_UNIQUE', [
  'universalIdentifier',
  'applicationId',
])
@Index('IDX_APP_OAUTH_PROVIDER_APPLICATION_ID', ['applicationId'])
@Index('IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID', ['workspaceId'])
export class ApplicationOAuthProviderEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => ApplicationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  displayName: string;

  @Column({ nullable: false, type: 'varchar' })
  authorizationEndpoint: string;

  @Column({ nullable: false, type: 'varchar' })
  tokenEndpoint: string;

  @Column({ nullable: true, type: 'varchar' })
  revokeEndpoint: string | null;

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
