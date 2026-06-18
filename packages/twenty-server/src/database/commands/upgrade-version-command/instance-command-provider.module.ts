import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    SecretEncryptionModule,
    JwtModule,
  ],
  providers: [...INSTANCE_COMMANDS],
})
export class InstanceCommandProviderModule {}
