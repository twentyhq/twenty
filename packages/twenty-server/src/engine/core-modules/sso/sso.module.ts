import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SamlIdentityProviderEntity } from './saml/saml-auth.entity';
import { SamlAuthService } from './saml/saml-auth.service';
import { OidcIdentityProviderEntity } from './oidc/oidc-auth.entity';
import { OidcAuthService } from './oidc/oidc-auth.service';
import { WorkspaceSSOEntity } from './workspace-sso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SamlIdentityProviderEntity,
      OidcIdentityProviderEntity,
      WorkspaceSSOEntity,
    ]),
  ],
  providers: [SamlAuthService, OidcAuthService],
  exports: [SamlAuthService, OidcAuthService],
})
export class SSOModule {}