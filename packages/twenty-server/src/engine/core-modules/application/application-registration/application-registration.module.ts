import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationClaimController } from 'src/engine/core-modules/application/application-registration/application-registration-claim.controller';
import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationResolver } from 'src/engine/core-modules/application/application-registration/application-registration.resolver';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSummaryResolver } from 'src/engine/core-modules/application/application-registration/application-registration-summary.resolver';
import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationEntity,
      WorkspaceEntity,
    ]),
    ApplicationRegistrationVariableModule,
    ApplicationModule,
    ApplicationPackageModule,
    CacheLockModule,
    CoreEntityCacheModule,
    DomainServerConfigModule,
    WorkspaceDomainsModule,
    FeatureFlagModule,
    GuardRedirectModule,
    JwtModule,
    PermissionsModule,
    FileStorageModule,
    FileUrlModule,
    MetricsModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [ApplicationRegistrationClaimController],
  providers: [
    ApplicationRegistrationService,
    ApplicationRegistrationClaimService,
    ApplicationRegistrationResolver,
    ApplicationRegistrationSummaryResolver,
    ApplicationTarballService,
    ApplicationRegistrationAssetService,
    ApplicationRegistrationAssetUrlService,
  ],
  exports: [
    ApplicationRegistrationService,
    ApplicationRegistrationClaimService,
    ApplicationRegistrationVariableModule,
    ApplicationRegistrationAssetService,
    ApplicationRegistrationAssetUrlService,
  ],
})
export class ApplicationRegistrationModule {}
