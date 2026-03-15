import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useSetIndexViews } from '@/metadata-store/hooks/useSetIndexViews';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
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

      const {
        flatViews,
        flatViewFields,
        flatViewFilters,
        flatViewSorts,
        flatViewGroups,
        flatViewFilterGroups,
        flatViewFieldGroups,
      } = splitViewWithRelated(result.data.getCoreViews);

      updateDraft('views', flatViews);
      updateDraft('viewFields', flatViewFields);
      updateDraft('viewFilters', flatViewFilters);
      updateDraft('viewSorts', flatViewSorts);
      updateDraft('viewGroups', flatViewGroups);
      updateDraft('viewFilterGroups', flatViewFilterGroups);
      updateDraft('viewFieldGroups', flatViewFieldGroups);
      applyChanges();
    }
  }, [client, setIndexViews, updateDraft, applyChanges]);

  return { fetchAndLoadIndexViews };
};
