import {
  ContextProviderName,
  getContextByProviderName,
} from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { scrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollLeftComponentState';
import { scrollTopComponentState } from '@/ui/utilities/scroll/states/scrollTopComponentState';

import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

import { useContext } from 'react';

export const useScrollStates = (contextProviderName: ContextProviderName) => {
  const Context = getContextByProviderName(contextProviderName);
  const context = useContext(Context);

  if (!context) {
    throw new Error('Context not found');
  }

  const { id: scopeId } = context;

  return {
    scrollLeftComponentState: extractComponentState(
      scrollLeftComponentState,
      scopeId,
    ),
    scrollTopComponentState: extractComponentState(
      scrollTopComponentState,
      scopeId,
    ),
  };
};
