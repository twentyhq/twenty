import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const faviconWithUnreadDotUrlFamilyState = createAtomFamilyState<
  string | null,
  string
>({
  key: 'faviconWithUnreadDotUrlFamilyState',
  defaultValue: null,
});
