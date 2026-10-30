import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';

export type BuiltInMcpClientApp = BuiltInApp & {
  id: 'chatgpt' | 'claude';
};
