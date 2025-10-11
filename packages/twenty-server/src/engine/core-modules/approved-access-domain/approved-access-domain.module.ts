import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { ApprovedAccessDomainResolver } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.resolver';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';

@Module({
  imports: [
    DomainManagerModule,
    FileModule,
    NestjsQueryTypeOrmModule.forFeature([ApprovedAccessDomain]),
  ],
  exports: [ApprovedAccessDomainService],
  providers: [ApprovedAccessDomainService, ApprovedAccessDomainResolver],
})
export class ApprovedAccessDomainModule {}
