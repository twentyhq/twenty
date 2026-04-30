import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SandboxEntity } from './sandbox.entity';
import { SandboxService } from './sandbox.service';
import { SandboxResolver } from './sandbox.resolver';
import { SandboxController } from './sandbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SandboxEntity])],
  controllers: [SandboxController],
  providers: [SandboxService, SandboxResolver],
  exports: [SandboxService],
})
export class SandboxModule {}