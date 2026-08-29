import { Module } from '@nestjs/common';

import { CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';

@Module({
  providers: [CommandShutdownService],
  exports: [CommandShutdownService],
})
export class CommandShutdownModule {}
