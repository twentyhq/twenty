import {
  type ConnectionProviderType,
  DEFAULT_CONNECTION_PROVIDER_ALLOWED_VISIBILITIES,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';
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

  @Column({
    type: 'varchar',
    array: true,
    nullable: false,
    default: DEFAULT_CONNECTION_PROVIDER_ALLOWED_VISIBILITIES,
  })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.47.0_AddConnectionProviderAllowedVisibilitiesFastInstanceCommand_1791710214770',
  })
  allowedVisibilities: ConnectedAccountVisibility[];

  @Column({ nullable: true, type: 'varchar' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.39.0_AddLogoToConnectionProviderFastInstanceCommand_1788542613404',
  })
  logo: string | null;

  @Column({ nullable: false, type: 'varchar' })
  type: ConnectionProviderType;

  @Column({ nullable: true, type: 'jsonb' })
  oauthConfig: StoredOAuthConnectionProviderConfig | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.47.0_AddAppConnectionIdentityFastInstanceCommand_1791708666509',
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
