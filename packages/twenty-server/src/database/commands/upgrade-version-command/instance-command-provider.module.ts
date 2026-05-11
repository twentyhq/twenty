import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';

@Module({
  imports: [SecretEncryptionModule],
  providers: [...INSTANCE_COMMANDS],
})
export class InstanceCommandProviderModule {}
