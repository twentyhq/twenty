import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';

export const isBuiltInAccountAppId = (
  appId: string | undefined,
): appId is BuiltInAccountApp['id'] =>
  BUILT_IN_ACCOUNT_APPS.some(
    (builtInAccountApp) => builtInAccountApp.id === appId,
  );
