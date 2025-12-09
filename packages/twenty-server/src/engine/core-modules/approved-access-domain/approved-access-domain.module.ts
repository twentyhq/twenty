import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { ApprovedAccessDomainResolver } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.resolver';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    WorkspaceDomainsModule,
    FileModule,
    NestjsQueryTypeOrmModule.forFeature([ApprovedAccessDomainEntity]),
    PermissionsModule,
  ],
  exports: [ApprovedAccessDomainService],
  providers: [ApprovedAccessDomainService, ApprovedAccessDomainResolver],
})
export class ApprovedAccessDomainModule {}
