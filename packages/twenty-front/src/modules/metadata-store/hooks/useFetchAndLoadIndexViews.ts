import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useSetIndexViews } from '@/metadata-store/hooks/useSetIndexViews';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  useFindAllCoreViewsLazyQuery,
  ViewType,
} from '~/generated-metadata/graphql';

const INDEX_VIEW_TYPES = [ViewType.TABLE, ViewType.KANBAN, ViewType.CALENDAR];

export const useFetchAndLoadIndexViews = () => {
  const [findAllCoreViews] = useFindAllCoreViewsLazyQuery();
  const { updateDraft, applyChanges } = useMetadataStore();
  const { setIndexViews } = useSetIndexViews();

  const fetchAndLoadIndexViews = useCallback(async () => {
    const result = await findAllCoreViews({
      variables: { viewTypes: INDEX_VIEW_TYPES },
      fetchPolicy: 'network-only',
    });

    if (isDefined(result.data?.getCoreViews)) {
      setIndexViews(result.data.getCoreViews);
      updateDraft('views', result.data.getCoreViews);
      applyChanges();
    }
  }, [findAllCoreViews, setIndexViews, updateDraft, applyChanges]);

  return { fetchAndLoadIndexViews };
};
