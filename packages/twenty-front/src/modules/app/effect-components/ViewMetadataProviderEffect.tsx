import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
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
  const currentUser = useRecoilValueV2(currentUserState);
  const store = useStore();

  const { updateDraft, applyChanges } = useMetadataStore();

  const isOnAuthPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const { data: queryDataCoreViews } = useFindAllCoreViewsQuery({
    skip: !isLoggedIn || isOnAuthPath,
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
    currentUser,
    queryDataCoreViews?.getCoreViews,
    setIndexCoreViews,
    updateDraft,
    applyChanges,
  ]);

  return null;
};
