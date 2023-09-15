import { Context, useRef } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export const RecoilScope = ({
  children,
  scopeId,
  SpecificContext,
}: {
  children: React.ReactNode;
  scopeId?: string;
  SpecificContext?: Context<string | null>;
}) => {
  const currentScopeId = useRef(scopeId ?? v4());

  return SpecificContext ? (
    <SpecificContext.Provider value={currentScopeId.current}>
      {children}
    </SpecificContext.Provider>
  ) : (
    <RecoilScopeContext.Provider value={currentScopeId.current}>
      {children}
    </RecoilScopeContext.Provider>
  );
};
