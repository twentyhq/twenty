import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SimpleSecretEncryptionUtil } from 'src/engine/core-modules/two-factor-authentication/utils/simple-secret-encryption.util';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    SecretEncryptionModule,
    // JwtModule is required by SimpleSecretEncryptionUtil. Drop both once the
    // 2.5 cross-upgrade window closes and the encrypt-totp-secrets slow command
    // is retired.
    JwtModule,
  ],
  providers: [...INSTANCE_COMMANDS, SimpleSecretEncryptionUtil],
})
export class InstanceCommandProviderModule {}
