import { createContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';

export const BoardContext = createContext<{
  BoardRecoilScopeContext: RecoilScopeContext;
}>({
  BoardRecoilScopeContext: createContext<string | null>(null),
});
