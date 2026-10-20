import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { NATIVE_APPLICATION_LOGOS } from '~/pages/settings/applications/constants/NativeApplicationLogos';

export const getNativeApplicationLogoUrl = (
  nativeAccountAppId: NativeAccountApp['id'],
) =>
  new URL(
    NATIVE_APPLICATION_LOGOS[nativeAccountAppId],
    window.location.href,
  ).toString();
