import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import GoogleLogo from '~/pages/settings/applications/assets/native-logos/google.svg';
import ImapLogo from '~/pages/settings/applications/assets/native-logos/imap.svg';
import OutlookLogo from '~/pages/settings/applications/assets/native-logos/outlook.svg';

export const NATIVE_APPLICATION_LOGOS: Record<NativeAccountApp['id'], string> =
  {
    google: GoogleLogo,
    outlook: OutlookLogo,
    imap: ImapLogo,
  };
