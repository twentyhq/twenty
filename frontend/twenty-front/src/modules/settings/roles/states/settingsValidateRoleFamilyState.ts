import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type Role } from '~/generated-metadata/graphql';

export const settingsValidateRoleFamilyState = createAtomFamilyState<
  Record<keyof Pick<Role, 'label'>, boolean>,
  string
>({
  key: 'settingsValidateRoleFamilyState',
  defaultValue: {
    label: false,
  },
});
