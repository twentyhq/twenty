import { Company } from '@/companies/types/Company';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const savedRecordsScopedState = createStateScopeMap<Company[]>({
  key: 'savedRecordsScopedState',
  defaultValue: [],
});
