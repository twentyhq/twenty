import { useRef } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext as RecoilScopeContextType } from '@/types/RecoilScopeContext';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

export const RecoilScope = ({
  children,
  scopeId,
  CustomRecoilScopeContext,
}: {
  children: React.ReactNode;
  scopeId?: string;
  CustomRecoilScopeContext?: RecoilScopeContextType;
}) => {
  const currentScopeId = useRef(scopeId ?? v4());

  return CustomRecoilScopeContext ? (
    <CustomRecoilScopeContext.Provider value={currentScopeId.current}>
      {children}
    </CustomRecoilScopeContext.Provider>
  ) : (
    <RecoilScopeContext.Provider value={currentScopeId.current}>
      {children}
    </RecoilScopeContext.Provider>
  );
};
