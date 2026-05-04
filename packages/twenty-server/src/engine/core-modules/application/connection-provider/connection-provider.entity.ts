import {
  type ConnectionProviderType,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';
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

@Entity({ name: 'connectionProvider', schema: 'core' })
@Unique('IDX_CONNECTION_PROVIDER_NAME_APPLICATION_UNIQUE', [
  'name',
  'applicationId',
])
@Index('IDX_CONNECTION_PROVIDER_APPLICATION_ID', ['applicationId'])
export class ConnectionProviderEntity
  extends SyncableEntity
  implements Required<ConnectionProviderEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  displayName: string;

  // Discriminator over how a connection's credentials are obtained. Today
  // only `oauth` exists; future types (PATs, API keys, basic auth) add their
  // own typed sub-config column alongside `oauthConfig`.
  @Column({ nullable: false, type: 'varchar' })
  type: ConnectionProviderType;

  // Populated when `type === 'oauth'`; null otherwise. Stored shape is
  // resolved/normalized — manifest defaults (usePkce, contentType, etc.)
  // are filled at write time so reads never branch on defaults.
  @Column({ nullable: true, type: 'jsonb' })
  oauthConfig: StoredOAuthConnectionProviderConfig | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
