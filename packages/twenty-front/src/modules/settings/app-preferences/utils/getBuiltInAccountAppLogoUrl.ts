import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';

export const getBuiltInAccountAppLogoUrl = (
  builtInAccountApp: Pick<BuiltInAccountApp, 'logo'>,
) => new URL(builtInAccountApp.logo, window.location.href).toString();
