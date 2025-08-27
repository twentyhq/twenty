import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type Role } from '~/generated-metadata/graphql';

export const settingsValidateRoleFamilyState = createFamilyState<
  Record<keyof Pick<Role, 'label'>, boolean>,
  string
>({
  key: 'settingsValidateRoleFamilyState',
  defaultValue: {
    label: false,
  },
});
