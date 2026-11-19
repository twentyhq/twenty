import { registerEnumType } from '@nestjs/graphql';

export enum MarketplaceAppKind {
  APP = 'APP',
  OAUTH_CLIENT = 'OAUTH_CLIENT',
  MCP_SERVER = 'MCP_SERVER',
}

registerEnumType(MarketplaceAppKind, { name: 'MarketplaceAppKind' });
