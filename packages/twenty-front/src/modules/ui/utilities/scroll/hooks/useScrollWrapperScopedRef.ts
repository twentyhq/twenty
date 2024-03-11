import { useContext } from 'react';

import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { ScrollWrapperContext } from '../components/ScrollWrapper';

export const useScrollWrapperScopedRef = () => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);

  if (isUndefinedOrNull(scrollWrapperRef))
    throw new Error(
      `Using a scroll ref without a ScrollWrapper : verify that you are using a ScrollWrapper if you intended to do so.`,
    );

  return scrollWrapperRef;
};
