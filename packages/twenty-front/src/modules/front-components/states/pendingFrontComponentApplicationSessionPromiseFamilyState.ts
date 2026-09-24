import { type FrontComponentApplicationSession } from '@/front-components/types/FrontComponentApplicationSession';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const pendingFrontComponentApplicationSessionPromiseFamilyState =
  createAtomFamilyState<
    Promise<FrontComponentApplicationSession> | null,
    string
  >({
    key: 'pendingFrontComponentApplicationSessionPromiseFamilyState',
    defaultValue: null,
  });
