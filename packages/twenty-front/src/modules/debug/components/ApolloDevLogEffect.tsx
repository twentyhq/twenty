import { useEffect } from 'react';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { useRecoilValue } from 'recoil';

import { isDebugModeState } from '@/client-config/states/isDebugModeState';

export const ApolloDevLogEffect = () => {
  const isDebugMode = useRecoilValue(isDebugModeState);

  useEffect(() => {
    if (isDebugMode) {
      loadDevMessages();
      loadErrorMessages();
    }
  }, [isDebugMode]);

  return null;
};
