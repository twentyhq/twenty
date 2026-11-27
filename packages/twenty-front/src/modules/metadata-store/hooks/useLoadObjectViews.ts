import { useReplaceViewsDraft } from '@/metadata-store/hooks/useReplaceViewsDraft';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { loadedViewsObjectMetadataIdsState } from '@/metadata-store/states/loadedViewsObjectMetadataIdsState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { FindManyViewsDocument } from '~/generated-metadata/graphql';

const objectViewsLoadsInFlight = new Map<string, Promise<void>>();

export const useLoadObjectViews = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyChanges } = useUpdateMetadataStoreDraft();
  const { replaceViewsDraft } = useReplaceViewsDraft();

  const loadObjectViews = useCallback(
    (objectMetadataId: string): Promise<void> => {
      const loadInFlight = objectViewsLoadsInFlight.get(objectMetadataId);

      if (isDefined(loadInFlight)) {
        return loadInFlight;
      }

      const load = client
        .query({
          query: FindManyViewsDocument,
          variables: { objectMetadataId },
          fetchPolicy: 'network-only',
        })
        .then((result) => {
          if (!isDefined(result.data)) {
            throw new CustomError(
              doNotTranslate('Failed to load object views'),
              'OBJECT_VIEWS_LOAD_FAILED',
            );
          }

          const { flatViews, ...addedViewChildren } = splitViewWithRelated(
            result.data.getViews,
          );

          const otherObjectViews = getDraftOrCurrentMetadataItems({
            store,
            metadataEntityKey: 'views',
          }).filter((view) => view.objectMetadataId !== objectMetadataId);

          replaceViewsDraft({
            views: [...otherObjectViews, ...flatViews],
            viewIdsKeepingChildren: new Set(
              otherObjectViews.map((view) => view.id),
            ),
            addedViewChildren,
          });

          applyChanges();

          if (
            store.get(metadataStoreState.atomFamily('views')).status !==
            'up-to-date'
          ) {
            return;
          }

          store.set(
            loadedViewsObjectMetadataIdsState.atom,
            (loadedViewsObjectMetadataIds) => [
              ...loadedViewsObjectMetadataIds,
              objectMetadataId,
            ],
          );
        })
        .finally(() => {
          objectViewsLoadsInFlight.delete(objectMetadataId);
        });

      objectViewsLoadsInFlight.set(objectMetadataId, load);

      return load;
    },
    [client, store, applyChanges, replaceViewsDraft],
  );

  return { loadObjectViews };
};
