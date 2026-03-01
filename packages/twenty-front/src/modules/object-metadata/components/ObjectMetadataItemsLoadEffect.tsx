import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const ObjectMetadataItemsLoadEffect = () => {
  const tokenPair = useRecoilValue(tokenPairState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasEnriched, setHasEnriched] = useState(false);

  // cache-first for fast initial load
  const { fetchAndStoreRawObjectMetadataItems, enrichWithPermissions } =
    useRefreshObjectMetadataItems();

  // network-only for background refresh
  const { fetchAndStoreRawObjectMetadataItems: backgroundFetchRawItems } =
    useRefreshObjectMetadataItems('network-only');

  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  // Phase 1: Fetch metadata as soon as we have a token (no user data needed)
  useEffect(() => {
    if (hasFetched) {
      return;
    }

    const isLoggedIn = isDefined(tokenPair);

    if (!isLoggedIn) {
      loadMockedObjectMetadataItems();
      setHasFetched(true);
      return;
    }

    setHasFetched(true);

    fetchAndStoreRawObjectMetadataItems()
      .then(() => {
        // Schedule a background network-only refresh for fresh data
        backgroundFetchRawItems().catch(() => {
          // Silently ignore background refresh errors
        });
      })
      .catch(() => {
        // If fetch fails, fall back to mocked items
        loadMockedObjectMetadataItems();
      });
  }, [
    tokenPair,
    hasFetched,
    fetchAndStoreRawObjectMetadataItems,
    backgroundFetchRawItems,
    loadMockedObjectMetadataItems,
  ]);

  // Phase 2: Enrich with permissions once user workspace data arrives
  useEffect(() => {
    if (hasEnriched) {
      return;
    }

    if (!isDefined(currentUserWorkspace)) {
      return;
    }

    setHasEnriched(true);
    enrichWithPermissions();
  }, [currentUserWorkspace, hasEnriched, enrichWithPermissions]);

  return <></>;
};
