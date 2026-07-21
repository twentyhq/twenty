/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOResolver } from 'src/engine/core-modules/sso/sso.resolver';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceSSOIdentityProviderEntity]),
    BillingModule,
    EnterpriseModule,
    GuardRedirectModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  exports: [SSOService],
  providers: [SSOService, SSOResolver],
})
export class WorkspaceSSOModule {}
