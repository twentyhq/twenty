/* @license Enterprise */

import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOResolver } from 'src/engine/core-modules/sso/sso.resolver';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { GuardManagerModule } from 'src/engine/core-modules/guard-manager/guard-manager.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature(
      [WorkspaceSSOIdentityProvider, User, AppToken, FeatureFlagEntity],
      'core',
    ),
    BillingModule,
    DomainManagerModule,
    GuardManagerModule,
  ],
  exports: [SSOService],
  providers: [SSOService, SSOResolver],
})
export class WorkspaceSSOModule {}
