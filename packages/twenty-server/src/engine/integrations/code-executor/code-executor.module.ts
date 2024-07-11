import { Module } from '@nestjs/common';

import { CodeExecutorService } from 'src/engine/integrations/code-executor/code-executor.service';

@Module({ providers: [CodeExecutorService], exports: [CodeExecutorService] })
export class CodeExecutorModule {}
