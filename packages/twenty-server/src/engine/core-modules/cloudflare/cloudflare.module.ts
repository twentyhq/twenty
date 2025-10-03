import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DnsCloudflareController } from 'src/engine/core-modules/cloudflare/controllers/dns-cloudflare.controller';
import { DnsCloudflareService } from 'src/engine/core-modules/cloudflare/services/dns-cloudflare.service';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([PublicDomain, Workspace]),
    WorkspaceModule,
    PublicDomainModule,
  ],
  providers: [DnsCloudflareService],
  controllers: [DnsCloudflareController],
})
export class CloudflareModule {}
