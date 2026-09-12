/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { SsoResolver } from 'src/engine/core-modules/sso/sso.resolver';
import { WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceSsoIdentityProviderEntity]),
    BillingModule,
    EnterpriseModule,
    GuardRedirectModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  exports: [SsoService],
  providers: [SsoService, SsoResolver],
})
export class WorkspaceSsoModule {}
