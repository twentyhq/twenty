import {
  CONNECTION_PROVIDER_SCOPES,
  type ConnectionProviderScope,
  type ConnectionProviderType,
  DEFAULT_CONNECTION_PROVIDER_SCOPE,
  type StoredCustomConnectionProviderConfig,
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

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
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

  @Column({ nullable: true, type: 'varchar' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.39.0_AddLogoToConnectionProviderFastInstanceCommand_1788542613404',
  })
  logo: string | null;

  @Column({ nullable: false, type: 'varchar' })
  type: ConnectionProviderType;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CONNECTION_PROVIDER_SCOPES,
    default: DEFAULT_CONNECTION_PROVIDER_SCOPE,
  })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.49.0_AddConnectionProviderScopeFastInstanceCommand_1792162723868',
  })
  scope: ConnectionProviderScope;

  @Column({ nullable: true, type: 'jsonb' })
  oauthConfig: StoredOAuthConnectionProviderConfig | null;

  @Column({ nullable: true, type: 'jsonb' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.52.0_AddCustomConfigToConnectionProviderFastInstanceCommand_1793032438836',
  })
  customConfig: StoredCustomConnectionProviderConfig | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.48.0_AddIdentifyAccountLogicFunctionAndExternalAccountIdFastInstanceCommand_1791975194413',
  })
  identifyAccountLogicFunctionUniversalIdentifier: string | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.24.0_AddOnConnectLogicFunctionToConnectionProviderFastInstanceCommand_1784712843602',
  })
  onConnectLogicFunctionUniversalIdentifier: string | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.27.0_AddOnDisconnectLogicFunctionToConnectionProviderFastInstanceCommand_1785810340935',
  })
  onDisconnectLogicFunctionUniversalIdentifier: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
