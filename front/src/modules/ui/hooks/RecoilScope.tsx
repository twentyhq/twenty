import { useState } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext } from './RecoilScopeContext';

export function RecoilScope({ children }: { children: React.ReactNode }) {
  const [currentScopeId] = useState(v4());

  return (
    <RecoilScopeContext.Provider value={currentScopeId}>
      {children}
    </RecoilScopeContext.Provider>
  );
}
