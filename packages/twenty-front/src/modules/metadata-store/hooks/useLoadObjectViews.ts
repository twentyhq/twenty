import { useReplaceViewMetadataSliceDraft } from '@/metadata-store/hooks/useReplaceViewMetadataSliceDraft';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectViewsHashesState } from '@/metadata-store/states/objectViewsHashesState';
import { getExpectedObjectViewsHash } from '@/metadata-store/utils/getExpectedObjectViewsHash';
import { getViewMetadataSlice } from '@/metadata-store/utils/getViewMetadataSlice';
import { getViewMetadataSliceFromViews } from '@/metadata-store/utils/getViewMetadataSliceFromViews';
import { replaceObjectViewsInViewMetadataSlice } from '@/metadata-store/utils/replaceObjectViewsInViewMetadataSlice';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindManyViewsDocument } from '~/generated-metadata/graphql';

type ObjectViewsLoadInFlight = {
  load: Promise<void>;
  expectedObjectViewsHash: string;
};

const objectViewsLoadsInFlight = new Map<string, ObjectViewsLoadInFlight>();

export const useLoadObjectViews = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyChanges } = useUpdateMetadataStoreDraft();
  const { replaceViewMetadataSliceDraft } = useReplaceViewMetadataSliceDraft();

  const loadObjectViews: (objectMetadataId: string) => Promise<void> =
    useCallback(
      (objectMetadataId: string): Promise<void> => {
        const expectedObjectViewsHash = getExpectedObjectViewsHash({
          objectViewsHashes: store.get(objectViewsHashesState.atom),
          objectMetadataId,
        });

        const loadInFlight = objectViewsLoadsInFlight.get(objectMetadataId);

        if (isDefined(loadInFlight)) {
          return loadInFlight.expectedObjectViewsHash ===
            expectedObjectViewsHash
            ? loadInFlight.load
            : loadInFlight.load.then(() => loadObjectViews(objectMetadataId));
        }

        const load = client
          .query({
            query: FindManyViewsDocument,
            variables: { objectMetadataId },
            fetchPolicy: 'network-only',
          })
          .then((result) => {
            if (!isDefined(result.data)) {
              throw new Error(
                `Failed to load views of object ${objectMetadataId}`,
              );
            }

            replaceViewMetadataSliceDraft(
              replaceObjectViewsInViewMetadataSlice({
                objectMetadataId,
                currentSlice: getViewMetadataSlice(store),
                fetchedObjectSlice: getViewMetadataSliceFromViews(
                  result.data.getViews,
                ),
              }),
            );

            applyChanges();

            const viewsAtom = metadataStoreState.atomFamily('views');

            if (store.get(viewsAtom).status !== 'up-to-date') {
              return;
            }

            store.set(viewsAtom, (previousViewsEntry) => ({
              ...previousViewsEntry,
              loadedViewHashByObjectMetadataId: {
                ...previousViewsEntry.loadedViewHashByObjectMetadataId,
                [objectMetadataId]: expectedObjectViewsHash,
              },
            }));
          })
          .finally(() => {
            objectViewsLoadsInFlight.delete(objectMetadataId);
          });

        objectViewsLoadsInFlight.set(objectMetadataId, {
          load,
          expectedObjectViewsHash,
        });

        return load;
      },
      [client, store, applyChanges, replaceViewMetadataSliceDraft],
    );

  return { loadObjectViews };
};
