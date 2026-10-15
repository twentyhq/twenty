import { useApolloClient } from '@apollo/client/react';
import { useEffect, useSyncExternalStore, useState } from 'react';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { getApplicationTranslationCatalogStore } from '@/front-components/stores/applicationTranslationCatalogStore';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useApplicationTranslationCatalog = ({
  applicationId,
  locale = SOURCE_LOCALE,
}: {
  applicationId: string;
  locale?: AppLocale;
}) => {
  const client = useApolloClient();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const store = getApplicationTranslationCatalogStore({
    client,
    workspaceId: currentWorkspace?.id,
    applicationId,
    locale,
  });
  const [hasFinishedInitialWait, setHasFinishedInitialWait] = useState(false);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: store.invalidate,
  });
  useListenToMetadataOperationBrowserEvent<{
    id: string;
    translationCatalogUpdated?: boolean;
  }>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: ({ operation }) => {
      if (
        operation.type === 'update' &&
        operation.updatedRecord.id === applicationId &&
        operation.updatedRecord.translationCatalogUpdated
      ) {
        store.invalidate();
      }
    },
  });

  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    if (snapshot.hasSettled) {
      setHasFinishedInitialWait(true);
      return;
    }
    const timeout = setTimeout(() => setHasFinishedInitialWait(true), 500);
    return () => clearTimeout(timeout);
  }, [snapshot.hasSettled]);

  return {
    translationCatalog: snapshot.translationCatalog,
    isWaitingForInitialCatalog:
      !hasFinishedInitialWait &&
      !snapshot.hasSettled &&
      locale !== SOURCE_LOCALE,
  };
};
