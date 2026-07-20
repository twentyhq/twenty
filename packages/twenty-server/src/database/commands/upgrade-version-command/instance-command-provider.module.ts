import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SimpleSecretEncryptionUtil } from 'src/engine/core-modules/two-factor-authentication/utils/simple-secret-encryption.util';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    SecretEncryptionModule,
    // JwtModule is required by SimpleSecretEncryptionUtil. Drop both once the
    // 2.5 cross-upgrade window closes and the encrypt-totp-secrets slow command
    // is retired.
    JwtModule,
    // Required by the 2.23 set-packaged-application-logic-function-execution-mode
    // slow command to install prebuilt bundles after the mode backfill.
    WorkspaceCacheModule,
  ],
  providers: [...INSTANCE_COMMANDS, SimpleSecretEncryptionUtil],
})
export class InstanceCommandProviderModule {}
