import { Company } from '@/companies/types/Company';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const savedCompaniesScopedState = createScopedState<Company[]>({
  key: 'savedCompaniesScopedState',
  defaultValue: [],
});
