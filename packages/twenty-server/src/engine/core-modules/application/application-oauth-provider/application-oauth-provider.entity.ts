import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

// Table name stays `applicationOAuthProvider` for now — the SyncableEntity
// metadataName (`connectionProvider`) is what consumers see in code, and a
// table rename would balloon this PR with mechanical churn unrelated to the
// sync-pipeline wiring. Tracked as separate cleanup.
@Entity({ name: 'applicationOAuthProvider', schema: 'core' })
@Unique('IDX_APP_OAUTH_PROVIDER_NAME_APPLICATION_UNIQUE', [
  'name',
  'applicationId',
])
@Index('IDX_APP_OAUTH_PROVIDER_APPLICATION_ID', ['applicationId'])
@Index('IDX_APP_OAUTH_PROVIDER_WORKSPACE_ID', ['workspaceId'])
export class ApplicationOAuthProviderEntity
  extends SyncableEntity
  implements Required<ApplicationOAuthProviderEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
