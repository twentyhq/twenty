import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import PlaceholderIllustration from '~/pages/settings/applications/assets/native-illustrations/placeholder.webp';

export const NATIVE_APPLICATION_ILLUSTRATIONS: Record<
  NativeAccountApp['id'],
  string
> = {
  google: PlaceholderIllustration,
  outlook: PlaceholderIllustration,
  imap: PlaceholderIllustration,
};
