import { Injectable } from '@nestjs/common';

import { ConnectionProviderDeclaredOAuthService } from 'src/engine/core-modules/application/connection-provider/connection-provider-declared-oauth.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderOAuthDiscoveryService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery.service';
import { type ConnectionProviderOAuthGrant } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-oauth-grant.type';

@Injectable()
export class ConnectionProviderOAuthGrantService {
  constructor(
    private readonly declaredOAuthService: ConnectionProviderDeclaredOAuthService,
    private readonly oauthDiscoveryService: ConnectionProviderOAuthDiscoveryService,
  ) {}

  getOrThrow(provider: ConnectionProviderEntity): ConnectionProviderOAuthGrant {
    switch (provider.type) {
      case 'oauth':
        return this.declaredOAuthService;
      case 'oauth-discovery':
        return this.oauthDiscoveryService;
      default:
        throw new ConnectionProviderException(
          `Connection provider "${provider.name}" (id ${provider.id}) does not use OAuth`,
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
    }
  }
}
