import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';

export const isBuiltInAccountAppId = (
  applicationId: string | undefined,
): applicationId is BuiltInAccountApp['id'] =>
  BUILT_IN_ACCOUNT_APPS.some(
    (builtInAccountApp) => builtInAccountApp.id === applicationId,
  );
