import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SSOResolver } from 'src/engine/core-modules/sso/sso.resolver';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([WorkspaceSSOIdentityProvider], 'core'),
  ],
  exports: [SSOService],
  providers: [SSOService, SSOResolver],
})
export class WorkspaceSSOModule {}
