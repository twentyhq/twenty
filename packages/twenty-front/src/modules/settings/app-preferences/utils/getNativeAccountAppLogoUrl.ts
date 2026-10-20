import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';

export const getNativeAccountAppLogoUrl = (
  nativeAccountApp: Pick<NativeAccountApp, 'logo'>,
) => new URL(nativeAccountApp.logo, window.location.href).toString();
