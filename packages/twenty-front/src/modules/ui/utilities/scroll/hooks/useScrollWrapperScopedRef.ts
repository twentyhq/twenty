import { useContext } from 'react';

import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import {
  ContextProviderName,
  getContextByProviderName,
} from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';

export const useScrollWrapperScopedRef = (
  contextProviderName: ContextProviderName,
) => {
  const Context = getContextByProviderName(contextProviderName);
  const scrollWrapperRef = useContext(Context);

  if (isUndefinedOrNull(scrollWrapperRef))
    throw new Error(
      `Using a scroll ref without a ScrollWrapper : verify that you are using a ScrollWrapper if you intended to do so.`,
    );

  return scrollWrapperRef;
};
