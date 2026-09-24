import { type FrontComponentApplicationSession } from '@/front-components/types/FrontComponentApplicationSession';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const frontComponentApplicationSessionFamilyState =
  createAtomFamilyState<FrontComponentApplicationSession | null, string>({
    key: 'frontComponentApplicationSessionFamilyState',
    defaultValue: null,
  });
