import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';

@Module({
  imports: [ConnectedAccountTokenEncryptionModule],
  providers: [...INSTANCE_COMMANDS],
})
export class InstanceCommandProviderModule {}
