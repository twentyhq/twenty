import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { ViewFilter } from '../types/ViewFilter';

export const unsavedToUpsertViewFiltersFamilyState =
createFamilyState<ViewFilter[], string>({
    key: 'unsavedToUpsertViewFiltersFamilyState',
    defaultValue: [],
  });
