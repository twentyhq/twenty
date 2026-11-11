import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const dashboardFilterSessionSearchFamilyState = createAtomFamilyState<
  string,
  { pageLayoutId: string }
>({
  key: 'dashboardFilterSessionSearchFamilyState',
  defaultValue: '',
});
