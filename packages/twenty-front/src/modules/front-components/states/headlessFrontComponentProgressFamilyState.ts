import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const headlessFrontComponentProgressFamilyState =
  createAtomFamilyState<number | undefined, string>({
    key: 'headlessFrontComponentProgressFamilyState',
    defaultValue: undefined,
  });
