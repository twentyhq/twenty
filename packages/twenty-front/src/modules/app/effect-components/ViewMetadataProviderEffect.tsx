import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { metadataStoreState } from '@/app/states/metadataStoreState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  ViewType as CoreViewType,
  useFindAllCoreViewsQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const INDEX_VIEW_TYPES = [
  CoreViewType.TABLE,
  CoreViewType.KANBAN,
  CoreViewType.CALENDAR,
];

export const ViewMetadataProviderEffect = () => {
  const location = useLocation();
  const isLoggedIn = useIsLogged();
  const store = useStore();

  const viewsEntry = useFamilyRecoilValueV2(metadataStoreState, 'views');

  const { updateDraft, applyChanges } = useMetadataStore();

  const isOnAuthPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const { data: queryDataCoreViews } = useFindAllCoreViewsQuery({
    skip: !isLoggedIn || viewsEntry.status !== 'empty' || isOnAuthPath,
    variables: { viewTypes: INDEX_VIEW_TYPES },
  });

  const setIndexCoreViews = useCallback(
    (indexViews: CoreViewWithRelations[]) => {
      const existingCoreViews = store.get(coreViewsState.atom);
      const existingFieldsWidgetViews = existingCoreViews.filter(
        (view) => view.type === CoreViewType.FIELDS_WIDGET,
      );
      const mergedViews = [...indexViews, ...existingFieldsWidgetViews];

      if (!isDeeplyEqual(existingCoreViews, mergedViews)) {
        store.set(coreViewsState.atom, mergedViews);
      }
    },
    [store],
  );

  // When logged in, wait for query data then draft + apply
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (!isDefined(queryDataCoreViews?.getCoreViews)) {
      return;
    }

    setIndexCoreViews(queryDataCoreViews.getCoreViews);
    updateDraft('views', queryDataCoreViews.getCoreViews);
    applyChanges();
  }, [
    isLoggedIn,
    queryDataCoreViews?.getCoreViews,
    setIndexCoreViews,
    updateDraft,
    applyChanges,
  ]);

  // When not logged in, views aren't fetched — promote an empty array
  // so the metadata store can reach 'loaded' status
  useEffect(() => {
    if (isLoggedIn || viewsEntry.status !== 'empty') {
      return;
    }

    updateDraft('views', []);
    applyChanges();
  }, [isLoggedIn, viewsEntry.status, updateDraft, applyChanges]);

  return null;
};
