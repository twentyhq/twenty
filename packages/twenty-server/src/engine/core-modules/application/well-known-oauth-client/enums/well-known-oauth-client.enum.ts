import { registerEnumType } from '@nestjs/graphql';

export enum WellKnownOAuthClient {
  CHATGPT = 'chatgpt',
  CLAUDE = 'claude',
}

registerEnumType(WellKnownOAuthClient, {
  name: 'WellKnownOAuthClient',
});
