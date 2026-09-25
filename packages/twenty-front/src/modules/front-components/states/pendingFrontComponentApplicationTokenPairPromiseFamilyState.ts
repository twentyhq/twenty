import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const pendingFrontComponentApplicationTokenPairPromiseFamilyState =
  createAtomFamilyState<
    Promise<FrontComponentApplicationTokenPair> | null,
    string
  >({
    key: 'pendingFrontComponentApplicationTokenPairPromiseFamilyState',
    defaultValue: null,
  });
