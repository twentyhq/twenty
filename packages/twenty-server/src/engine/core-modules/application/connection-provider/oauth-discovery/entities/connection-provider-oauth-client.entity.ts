import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_OAUTH_DISCOVERY_TO_CONNECTION_PROVIDER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-59/add-oauth-discovery-to-connection-provider-upgrade-command-name.constant';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type OAuthDiscoveryRegistrationMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-registration-method.type';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'connectionProviderOAuthClient', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName:
    ADD_OAUTH_DISCOVERY_TO_CONNECTION_PROVIDER_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_CONNECTION_PROVIDER_OAUTH_CLIENT_PROVIDER_ID_UNIQUE',
  ['connectionProviderId'],
  { unique: true },
)
@Check(
  'CHK_connectionProviderOAuthClient_clientSecret_encrypted',
  `"clientSecret" IS NULL OR "clientSecret" LIKE 'enc:v2:%'`,
)
export class ConnectionProviderOAuthClientEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  connectionProviderId: string;

  @ManyToOne(() => ConnectionProviderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectionProviderId' })
  connectionProvider: Relation<ConnectionProviderEntity>;

  @Column({ type: 'varchar', nullable: false })
  registrationMethod: OAuthDiscoveryRegistrationMethod;

  @Column({ type: 'varchar', nullable: false })
  clientId: string;

  @Column({ type: 'varchar', nullable: true })
  clientSecret: EncryptedString | null;

  @Column({ type: 'timestamptz', nullable: true })
  clientSecretExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  tokenEndpointAuthMethod: string | null;

  @Column({ type: 'varchar', nullable: false })
  redirectUri: string;

  @Column({ type: 'jsonb', nullable: false })
  discoveryState: OAuthDiscoveryState;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
