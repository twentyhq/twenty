import { PRIVATE_VIEW_TYPES } from '@/metadata-store/constants/PrivateViewTypes';
import { SHARED_VIEW_TYPE_GROUPS } from '@/metadata-store/constants/SharedViewTypeGroups';
import { VIEW_FAMILY_RETRY_DELAY_MS } from '@/metadata-store/constants/ViewFamilyRetryDelayMs';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { removedViewIdsState } from '@/metadata-store/states/removedViewIdsState';
import { viewFamilyHintState } from '@/metadata-store/states/viewFamilyHintState';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import {
  type FindMyPrivateViewsQuery,
  type FindSharedViewsQuery,
  type ViewFamilyResponse,
} from '@/metadata-store/types/ViewFamilyQueries';
import { getViewFamilyHintFromCollectionHashes } from '@/metadata-store/utils/getViewFamilyHintFromCollectionHashes';
import { isViewFamilySplitModeActive } from '@/metadata-store/utils/isViewFamilySplitModeActive';
import { resolveViewFamilyLoadOutcome } from '@/metadata-store/utils/resolveViewFamilyLoadOutcome';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { FIND_MY_PRIVATE_VIEWS } from '@/views/graphql/queries/findMyPrivateViews';
import { FIND_SHARED_VIEWS } from '@/views/graphql/queries/findSharedViews';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

type CommittableViewFamily = {
  familyVersion: string;
  views: ViewFamilyResponse['views'];
};

export const useLoadViewFamily = () => {
  const client = useApolloClient();
  const store = useStore();
  const { replaceDraft } = useUpdateMetadataStoreDraft();

  const isSplitModeActive = useCallback(
    () => isViewFamilySplitModeActive(store),
    [store],
  );

  const fetchViewFamilyResponses = useCallback(async () => {
    const [sharedResults, privateResult] = await Promise.all([
      Promise.all(
        SHARED_VIEW_TYPE_GROUPS.map((viewTypes) =>
          client.query<FindSharedViewsQuery>({
            query: FIND_SHARED_VIEWS,
            variables: { viewTypes },
            fetchPolicy: 'network-only',
          }),
        ),
      ),
      client.query<FindMyPrivateViewsQuery>({
        query: FIND_MY_PRIVATE_VIEWS,
        variables: { viewTypes: PRIVATE_VIEW_TYPES },
        fetchPolicy: 'network-only',
      }),
    ]);

    const responses = [
      ...sharedResults.map((sharedResult) => sharedResult.data?.getSharedViews),
      privateResult.data?.getMyPrivateViews,
    ];

    if (!responses.every(isDefined)) {
      throw new Error('View family load returned no data');
    }

    return responses;
  }, [client]);

  const refreshViewFamilyHint = useCallback(async () => {
    const result = await client.query<FindMinimalMetadataQuery>({
      query: FIND_MINIMAL_METADATA,
      fetchPolicy: 'network-only',
    });

    const hint = getViewFamilyHintFromCollectionHashes(
      result.data?.minimalMetadata.collectionHashes,
    );

    store.set(viewFamilyHintState.atom, hint);

    return hint;
  }, [client, store]);

  const installViewFamily = useCallback(
    ({ familyVersion, views }: CommittableViewFamily) => {
      const {
        flatViews,
        flatViewFields,
        flatViewFilters,
        flatViewSorts,
        flatViewGroups,
        flatViewFilterGroups,
        flatViewFieldGroups,
      } = splitViewWithRelated(views);

      replaceDraft('views', flatViews, familyVersion);
      replaceDraft('viewFields', flatViewFields, familyVersion);
      replaceDraft('viewFilters', flatViewFilters, familyVersion);
      replaceDraft('viewSorts', flatViewSorts, familyVersion);
      replaceDraft('viewGroups', flatViewGroups, familyVersion);
      replaceDraft('viewFilterGroups', flatViewFilterGroups, familyVersion);
      replaceDraft('viewFieldGroups', flatViewFieldGroups, familyVersion);

      store.set(removedViewIdsState.atom, []);
    },
    [replaceDraft, store],
  );

  const attemptViewFamilyLoad = useCallback(async (): Promise<boolean> => {
    store.set(viewFamilyLoadEpochState.atom, (epoch) => epoch + 1);

    const startEpoch = store.get(viewFamilyLoadEpochState.atom);
    const isSuperseded = () =>
      store.get(viewFamilyLoadEpochState.atom) !== startEpoch ||
      !isSplitModeActive();

    const responses = await fetchViewFamilyResponses();
    const familyVersions = responses.map((response) => response.familyVersion);

    const outcome = resolveViewFamilyLoadOutcome({
      familyVersions,
      hasEpochChanged: isSuperseded(),
      hint: store.get(viewFamilyHintState.atom),
    });

    if (outcome.type === 'mismatch') {
      return false;
    }

    const hint =
      outcome.type === 'confirm-hint'
        ? await refreshViewFamilyHint()
        : store.get(viewFamilyHintState.atom);

    const confirmedOutcome = resolveViewFamilyLoadOutcome({
      familyVersions,
      hasEpochChanged: isSuperseded(),
      hint,
    });

    if (confirmedOutcome.type !== 'commit') {
      return false;
    }

    installViewFamily({
      familyVersion: confirmedOutcome.familyVersion,
      views: responses.flatMap((response) => response.views),
    });

    return true;
  }, [
    store,
    isSplitModeActive,
    fetchViewFamilyResponses,
    refreshViewFamilyHint,
    installViewFamily,
  ]);

  const loadViewFamily = useCallback(async () => {
    if (await attemptViewFamilyLoad()) {
      return;
    }

    await sleep(
      VIEW_FAMILY_RETRY_DELAY_MS + Math.random() * VIEW_FAMILY_RETRY_DELAY_MS,
    );

    if (await attemptViewFamilyLoad()) {
      return;
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (!isDefined(viewsEntry.currentCollectionHash)) {
      throw new Error(
        'View family stayed inconsistent across retries; no authoritative views installed',
      );
    }
  }, [attemptViewFamilyLoad, store]);

  return { loadViewFamily, isSplitModeActive };
};
