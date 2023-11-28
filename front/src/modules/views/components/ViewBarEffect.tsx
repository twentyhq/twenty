import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useViewBar } from '@/views/hooks/useViewBar';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import { getViewScopedStatesFromSnapshot } from '../utils/getViewScopedStatesFromSnapshot';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    loadView,
    changeViewInUrl,
    loadViewFields,
    loadViewFilters,
    loadViewSorts,
  } = useViewBar();

  const [searchParams] = useSearchParams();
  const currentViewIdFromUrl = searchParams.get('view');

  const { viewTypeState, viewObjectMetadataIdState } = useViewScopedStates();

  const viewType = useRecoilValue(viewTypeState);
  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);

  useFindManyObjectRecords({
    skip: !viewObjectMetadataId,
    objectNamePlural: 'views',
    filter: {
      type: { eq: viewType },
      objectMetadataId: { eq: viewObjectMetadataId },
    },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<GraphQLView>) => {
          const nextViews = data.edges.map(({ node }) => node);

          const { viewsState, currentViewIdState } =
            getViewScopedStatesFromSnapshot({
              snapshot,
              viewScopeId,
            });

          const views = getSnapshotValue(snapshot, viewsState);

          if (!isDeeplyEqual(views, nextViews)) {
            set(viewsState, nextViews);
          }

          const currentView =
            data.edges
              .map((view) => view.node)
              .find((view) => view.id === currentViewIdFromUrl) ??
            data.edges[0]?.node ??
            null;

          if (!currentView) return;

          set(currentViewIdState, currentView.id);

          if (currentView?.viewFields) {
            loadViewFields(currentView.viewFields, currentView.id);
            loadViewFilters(currentView.viewFilters, currentView.id);
            loadViewSorts(currentView.viewSorts, currentView.id);
          }

          if (!nextViews.length) return;
          if (!currentViewIdFromUrl) return changeViewInUrl(nextViews[0].id);
        },
    ),
  });

  useEffect(() => {
    if (!currentViewIdFromUrl) return;

    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView]);

  return <></>;
};
