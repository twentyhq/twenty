import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const apiKeyTokenFamilyState = createFamilyStateV2<
  string | null,
  string
>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
