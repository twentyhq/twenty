import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const appRegistrationClientSecretFamilyState =
  createAtomFamilyState<string | null, string>({
    key: 'appRegistrationClientSecretState',
    defaultValue: null,
  });
