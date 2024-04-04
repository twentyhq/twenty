import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const hasNextPageFamilyState = createFamilyState<
  boolean,
  string | undefined
>({
  key: 'hasNextPageFamilyState',
  defaultValue: false,
});
