import {
  type ConnectionProviderType,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
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

  @Column({ nullable: false, type: 'varchar' })
  type: ConnectionProviderType;

  @Column({ nullable: true, type: 'jsonb' })
  oauthConfig: StoredOAuthConnectionProviderConfig | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
