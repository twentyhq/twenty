import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainResolver } from 'src/engine/core-modules/public-domain/public-domain.resolver';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([PublicDomain, Workspace]),
    DnsManagerModule,
  ],
  providers: [PublicDomainService, PublicDomainResolver],
})
export class PublicDomainModule {}
