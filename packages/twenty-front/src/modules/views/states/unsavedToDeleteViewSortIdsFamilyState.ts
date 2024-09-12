import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const unsavedToDeleteViewSortIdsFamilyState =
createFamilyState<string[], string>({
    key: 'unsavedToDeleteViewSortIdsFamilyState',
    defaultValue: [],
  });
