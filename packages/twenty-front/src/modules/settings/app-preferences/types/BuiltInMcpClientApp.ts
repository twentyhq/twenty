import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type IconComponent } from 'twenty-ui/icon';
import { type WellKnownOAuthClient } from '~/generated-metadata/graphql';

export type BuiltInMcpClientApp = BuiltInApp & {
  id: 'chatgpt' | 'claude';
  Icon: IconComponent;
  wellKnownOAuthClient: WellKnownOAuthClient;
};
