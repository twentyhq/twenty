import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { createContext } from 'react';

export const PageLayoutIdContext = createContext<string | null | undefined>(
  undefined,
);

export const currentPageLayoutIdState = createAtomState<string | null>({
  key: 'currentPageLayoutIdState',
  defaultValue: null,
});
