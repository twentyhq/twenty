/* @license Enterprise */

import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { SsoService } from 'src/engine/core-modules/Sso/services/Sso.service';
import { SsoResolver } from 'src/engine/core-modules/Sso/Sso.resolver';
import { WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([
      WorkspaceSsoIdentityProviderEntity,
      UserEntity,
      AppTokenEntity,
      FeatureFlagEntity,
    ]),
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
