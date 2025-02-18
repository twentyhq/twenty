import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.entity';
import { WorkspaceTrustedDomainService } from 'src/engine/core-modules/workspace-trusted-domain/services/workspace-trusted-domain.service';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([WorkspaceTrustedDomain], 'core'),
  ],
  exports: [WorkspaceTrustedDomainService],
  providers: [WorkspaceTrustedDomainService],
})
export class WorkspaceTrustedDomainModule {}
