import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useSetIndexViews } from '@/metadata-store/hooks/useSetIndexViews';
import { type View } from '@/views/types/View';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import {
  ViewType,
  FindAllCoreViewsDocument,
} from '~/generated-metadata/graphql';

const INDEX_VIEW_TYPES = [ViewType.TABLE, ViewType.KANBAN, ViewType.CALENDAR];

export const useFetchAndLoadIndexViews = () => {
  const client = useApolloClient();
  const { updateDraft, applyChanges } = useMetadataStore();
  const { setIndexViews } = useSetIndexViews();

  const fetchAndLoadIndexViews = useCallback(async () => {
    const result = await client.query({
      query: FindAllCoreViewsDocument,
      variables: { viewTypes: INDEX_VIEW_TYPES },
      fetchPolicy: 'network-only',
    });

    if (isDefined(result.data?.getCoreViews)) {
      setIndexViews(result.data.getCoreViews);
      // TODO: align generated ViewType with app ViewType to remove this cast
      updateDraft('views', result.data.getCoreViews as unknown as View[]);
      applyChanges();
    }
  }, [client, setIndexViews, updateDraft, applyChanges]);

  return { fetchAndLoadIndexViews };
};
