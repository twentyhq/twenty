import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { ApprovedAccessDomainResolver } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.resolver';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
@Module({
  imports: [
    WorkspaceDomainsModule,
    FileModule,
    JwtModule,
    TypeOrmModule.forFeature([ApprovedAccessDomainEntity]),
    PermissionsModule,
  ],
  exports: [ApprovedAccessDomainService],
  providers: [
    ApprovedAccessDomainService,
    ApprovedAccessDomainResolver,
    provideWorkspaceScopedRepository(ApprovedAccessDomainEntity),
  ],
})
export class ApprovedAccessDomainModule {}
