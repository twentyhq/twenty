import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { ApprovedAccessDomainResolver } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.resolver';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';

@Module({
  imports: [
    DomainManagerModule,
    NestjsQueryTypeOrmModule.forFeature([ApprovedAccessDomain], 'core'),
  ],
  exports: [ApprovedAccessDomainService],
  providers: [ApprovedAccessDomainService, ApprovedAccessDomainResolver],
})
export class ApprovedAccessDomainModule {}
