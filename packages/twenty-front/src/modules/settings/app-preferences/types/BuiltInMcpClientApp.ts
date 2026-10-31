import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type WellKnownOAuthClient } from '~/generated-metadata/graphql';

export type BuiltInMcpClientApp = BuiltInApp & {
  id: 'chatgpt' | 'claude';
  wellKnownOAuthClient: WellKnownOAuthClient;
};
