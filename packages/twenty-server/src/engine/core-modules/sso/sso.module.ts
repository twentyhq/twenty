/* @license Enterprise */

import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GuardRedirectModule } from 'src/engine/core-modules/guard-redirect/guard-redirect.module';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOResolver } from 'src/engine/core-modules/sso/sso.resolver';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([
      WorkspaceSSOIdentityProviderEntity,
      UserEntity,
      AppTokenEntity,
      FeatureFlagEntity,
    ]),
    BillingModule,
    GuardRedirectModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  exports: [SSOService],
  providers: [SSOService, SSOResolver],
})
export class WorkspaceSSOModule {}
