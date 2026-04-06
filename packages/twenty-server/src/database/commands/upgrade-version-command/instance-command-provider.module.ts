import { Module } from '@nestjs/common';

import { INSTANCE_COMMANDS } from 'src/database/commands/upgrade-version-command/instance-commands.constant';

@Module({
  providers: [...INSTANCE_COMMANDS],
})
export class InstanceCommandProviderModule {}
