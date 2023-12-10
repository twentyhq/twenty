import { Company } from '@/companies/types/Company';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const savedRecordsScopedState = createScopedState<Company[]>({
  key: 'savedRecordsScopedState',
  defaultValue: [],
});
