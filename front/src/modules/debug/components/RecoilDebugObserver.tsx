import { useEffect } from 'react';
import { useRecoilSnapshot, useRecoilValue } from 'recoil';

import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { logDebug } from '~/utils/logDebug';

const formatTitle = (stateName: string) => {
  const headerCss = [
    'color: gray; font-weight: lighter',
    'color: black; font-weight: bold;',
  ];

  const parts = ['%c recoil', `%c${stateName}`];

  return [parts.join(' '), ...headerCss];
};

export const RecoilDebugObserverEffect = () => {
  const snapshot = useRecoilSnapshot();

  const isDebugMode = useRecoilValue(isDebugModeState);

  useEffect(() => {
    if (!isDebugMode) {
      return;
    }

    for (const node of Array.from(
      snapshot.getNodes_UNSTABLE({ isModified: true }),
    )) {
      const loadable = snapshot.getLoadable(node);

      const titleArgs = formatTitle(node.key);

      console.groupCollapsed(...titleArgs);

      logDebug('STATE', loadable.state);

      logDebug('CONTENTS', loadable.contents);

      console.groupEnd();
    }
  }, [isDebugMode, snapshot]);

  return null;
};
