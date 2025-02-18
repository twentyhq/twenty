import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.entity';
import { WorkspaceTrustedDomainService } from 'src/engine/core-modules/workspace-trusted-domain/services/workspace-trusted-domain.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { WorkspaceTrustedDomainResolver } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.resolver';

@Module({
  imports: [
    DomainManagerModule,
    NestjsQueryTypeOrmModule.forFeature([WorkspaceTrustedDomain], 'core'),
  ],
  exports: [WorkspaceTrustedDomainService],
  providers: [WorkspaceTrustedDomainService, WorkspaceTrustedDomainResolver],
})
export class WorkspaceTrustedDomainModule {}
