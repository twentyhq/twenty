import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type IconComponent } from 'twenty-ui/icon';

export type BuiltInMcpClientApp = BuiltInApp & {
  id: 'chatgpt' | 'claude';
  Icon: IconComponent;
  redirectUriHostnames: string[];
};
