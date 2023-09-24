import { createContext } from 'react';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';

import { type View } from '../types/View';

export const ViewBarContext = createContext<{
  canPersistViewFields?: boolean;
  defaultViewName?: string;
  onCurrentViewSubmit?: () => void | Promise<void>;
  onViewBarReset?: () => void;
  onViewCreate?: (view: View) => void | Promise<void>;
  onViewEdit?: (view: View) => void | Promise<void>;
  onViewRemove?: (viewId: string) => void | Promise<void>;
  onViewSelect?: (viewId: string) => void | Promise<void>;
  onImport?: () => void | Promise<void>;
  ViewBarRecoilScopeContext: RecoilScopeContext;
}>({
  ViewBarRecoilScopeContext: createContext<string | null>(null),
});
