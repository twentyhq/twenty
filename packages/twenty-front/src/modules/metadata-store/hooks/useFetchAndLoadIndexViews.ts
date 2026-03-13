import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useSetIndexViews } from '@/metadata-store/hooks/useSetIndexViews';
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
      updateDraft('views', result.data.getCoreViews);
      applyChanges();
    }
  }, [client, setIndexViews, updateDraft, applyChanges]);

  return { fetchAndLoadIndexViews };
};
