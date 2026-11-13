import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconKey } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { connectApplicationWithApiKeyTargetComponentState } from '@/side-panel/pages/connect-application-with-api-key/states/connectApplicationWithApiKeyTargetComponentState';
import { type ConnectApplicationWithApiKeyTarget } from '@/side-panel/pages/connect-application-with-api-key/types/ConnectApplicationWithApiKeyTarget';

export const useOpenConnectApplicationWithApiKeyInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openConnectApplicationWithApiKeyInSidePanel = useCallback(
    (target: ConnectApplicationWithApiKeyTarget) => {
      const pageId = v4();

      store.set(
        connectApplicationWithApiKeyTargetComponentState.atomFamily({
          instanceId: pageId,
        }),
        target,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ConnectApplicationWithApiKey,
        pageTitle: t`Connect ${target.providerDisplayName}`,
        pageIcon: IconKey,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openConnectApplicationWithApiKeyInSidePanel };
};
