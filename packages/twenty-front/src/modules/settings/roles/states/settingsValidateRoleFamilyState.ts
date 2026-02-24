import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type Role } from '~/generated-metadata/graphql';

export const settingsValidateRoleFamilyState = createFamilyStateV2<
  Record<keyof Pick<Role, 'label'>, boolean>,
  string
>({
  key: 'settingsValidateRoleFamilyState',
  defaultValue: {
    label: false,
  },
});
