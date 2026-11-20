import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const faviconWithUnreadDotState = createAtomState<{
  faviconUrl: string;
  href: string;
} | null>({
  key: 'faviconWithUnreadDotState',
  defaultValue: null,
});
