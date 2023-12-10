import { useContext } from 'react';

import { ScrollWrapperContext } from '../components/ScrollWrapper';

export const useScrollWrapperScopedRef = () => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);

  if (!scrollWrapperRef)
    throw new Error(
      `Using a scoped ref without a ScrollWrapper : verify that you are using a ScrollWrapper if you intended to do so.`,
    );

  return scrollWrapperRef;
};
