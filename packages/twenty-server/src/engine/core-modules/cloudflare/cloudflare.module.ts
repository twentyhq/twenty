import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { DnsCloudflareController } from 'src/engine/core-modules/cloudflare/controllers/dns-cloudflare.controller';
import { DnsCloudflareService } from 'src/engine/core-modules/cloudflare/services/dns-cloudflare.service';
import { CustomDomainManagerModule } from 'src/engine/core-modules/domain/custom-domain-manager/custom-domain-manager.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([PublicDomainEntity, WorkspaceEntity]),
    WorkspaceDomainsModule,
    CustomDomainManagerModule,
    PublicDomainModule,
  ],
  providers: [DnsCloudflareService],
  controllers: [DnsCloudflareController],
})
export class CloudflareModule {}
