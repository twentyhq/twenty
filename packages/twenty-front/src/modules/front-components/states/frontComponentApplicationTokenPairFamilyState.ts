import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const frontComponentApplicationTokenPairFamilyState =
  createAtomFamilyState<FrontComponentApplicationTokenPair | null, string>({
    key: 'frontComponentApplicationTokenPairFamilyState',
    defaultValue: null,
  });
