import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { atomsForScopeGarbageCollectorState } from './atomsForScopeGarbageCollectorState';
import { RecoilScopeContext } from './RecoilScopeContext';

export function RecoilScope({ children }: { children: React.ReactNode }) {
  const [currentScopeId] = useState(v4());

  return (
    <RecoilScopeContext.Provider value={currentScopeId}>
      {children}
    </RecoilScopeContext.Provider>
  );
}
