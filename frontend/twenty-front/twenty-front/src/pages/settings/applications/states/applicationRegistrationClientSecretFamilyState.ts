import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const applicationRegistrationClientSecretFamilyState =
  createAtomFamilyState<string | null, string>({
    key: 'applicationRegistrationClientSecretState',
    defaultValue: null,
  });
