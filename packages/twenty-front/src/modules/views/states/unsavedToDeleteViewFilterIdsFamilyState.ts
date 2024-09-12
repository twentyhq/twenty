import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

// TODO: turn this into a family state per view id
export const unsavedToDeleteViewFilterIdsFamilyState =
createFamilyState<string[], string>({
    key: 'unsavedToDeleteViewFilterIdsFamilyState',
    defaultValue: [],
  });
