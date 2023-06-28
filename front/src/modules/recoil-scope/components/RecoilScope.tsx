import { Context, useRef } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export function RecoilScope({
  SpecificContext,
  children,
}: {
  SpecificContext?: Context<string | null>;
  children: React.ReactNode;
}) {
  const currentScopeId = useRef(v4());

  return SpecificContext ? (
    <SpecificContext.Provider value={currentScopeId.current}>
      {children}
    </SpecificContext.Provider>
  ) : (
    <RecoilScopeContext.Provider value={currentScopeId.current}>
      {children}
    </RecoilScopeContext.Provider>
  );
}
