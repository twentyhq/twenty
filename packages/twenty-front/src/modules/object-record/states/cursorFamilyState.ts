import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const cursorFamilyState = createFamilyStateV2<
  string,
  string | undefined
>({
  key: 'cursorFamilyState',
  defaultValue: '',
});
