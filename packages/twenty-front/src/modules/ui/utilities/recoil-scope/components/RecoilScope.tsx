import { useRef } from 'react';
import { v4 } from 'uuid';

import { RecoilScopeContext as RecoilScopeContextType } from '@/types/RecoilScopeContext';

import { RecoilScopeContext } from '../states/RecoilScopeContext';

/**
 *
 * @deprecated Use a custom scope context instead, see example with DropdownScope
 */
export const RecoilScope = ({
  children,
  scopeId,
  CustomRecoilScopeContext,
}: {
  children: React.ReactNode;
  scopeId?: string;
  CustomRecoilScopeContext?: RecoilScopeContextType;
}) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
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
