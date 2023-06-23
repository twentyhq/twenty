import { Context, useState } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export function RecoilScope({
  SpecificContext,
  children,
}: {
  SpecificContext?: Context<string | null>;
  children: React.ReactNode;
}) {
  const [currentScopeId] = useState(v4());

  return SpecificContext ? (
    <SpecificContext.Provider value={currentScopeId}>
      {children}
    </SpecificContext.Provider>
  ) : (
    <RecoilScopeContext.Provider value={currentScopeId}>
      {children}
    </RecoilScopeContext.Provider>
  );
}
