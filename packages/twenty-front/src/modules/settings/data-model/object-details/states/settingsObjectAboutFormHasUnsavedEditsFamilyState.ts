import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsObjectAboutFormHasUnsavedEditsFamilyState =
  createAtomFamilyState<boolean, { objectMetadataItemId: string }>({
    key: 'settingsObjectAboutFormHasUnsavedEditsFamilyState',
    scope: 'routed-flow',
    defaultValue: false,
  });
