import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainResolver } from 'src/engine/core-modules/public-domain/public-domain.resolver';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ApprovedAccessDomain, PublicDomain]),
    DomainManagerModule,
  ],
  providers: [PublicDomainService, PublicDomainResolver],
})
export class PublicDomainModule {}
