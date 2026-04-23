import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SamlIdentityProviderEntity } from './saml/saml-auth.entity';
import { SamlAuthService } from './saml/saml-auth.service';
import { OidcIdentityProviderEntity } from './oidc/oidc-auth.entity';
import { OidcAuthService } from './oidc/oidc-auth.service';
import { WorkspaceSSOEntity } from './workspace-sso.entity';
import { SSOService } from './services/sso.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SamlIdentityProviderEntity,
      OidcIdentityProviderEntity,
      WorkspaceSSOEntity,
    ]),
  ],
  providers: [SamlAuthService, OidcAuthService, SSOService],
  exports: [SamlAuthService, OidcAuthService, SSOService],
})
export class SSOModule {}

export { SSOModule as WorkspaceSSOModule };
