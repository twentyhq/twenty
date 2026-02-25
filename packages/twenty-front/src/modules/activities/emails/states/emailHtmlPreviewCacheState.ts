import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const emailHtmlPreviewCacheState = createAtomFamilyState<
  string | null,
  string
>({
  key: 'emailHtmlPreviewCacheState',
  defaultValue: null,
});
