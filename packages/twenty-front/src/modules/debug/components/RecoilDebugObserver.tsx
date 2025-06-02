import { useRecoilTransactionObserver_UNSTABLE } from 'recoil';

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
  const isDebugMode = process.env.IS_DEBUG_MODE === 'true';

  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
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
  });
  return null;
};
