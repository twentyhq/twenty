import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';

export const getBuiltInAppLogoUrl = (builtInApp: Pick<BuiltInApp, 'logo'>) =>
  new URL(builtInApp.logo, window.location.href).toString();
