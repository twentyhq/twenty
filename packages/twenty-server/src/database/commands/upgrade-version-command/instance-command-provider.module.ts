import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    SecretEncryptionModule,
    // JwtModule provides JwtWrapperService, required by the 2.5
    // encrypt-totp-secrets slow command to read legacy AES-CBC TOTP secrets
    // during the cross-upgrade window. Drop once that command is retired.
    JwtModule,
  ],
  providers: [...INSTANCE_COMMANDS],
})
export class InstanceCommandProviderModule {}
