import { Module } from '@nestjs/common';

import { MontyPoolService } from 'src/engine/core-modules/code-mode/services/monty-pool.service';

@Module({
  providers: [MontyPoolService],
  exports: [MontyPoolService],
})
export class CodeModeModule {}
