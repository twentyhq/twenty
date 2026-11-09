import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { getDashboardFilterWidgetRows } from '@/page-layout/utils/getDashboardFilterWidgetRows';
import { getDashboardFilterWidgets } from '@/page-layout/utils/getDashboardFilterWidgets';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { useMemo } from 'react';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const useDashboardFilterWidgetRows = ({
  pageLayoutId,
  pageLayoutFilter,
}: {
  pageLayoutId: string;
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'type'>;
}) => {
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const viewsByIdMap = useAtomStateValue(viewsByIdMapSelector);

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const persistedWidgetsById = useMemo(
    () =>
      new Map(
        (pageLayoutPersisted?.tabs ?? [])
          .flatMap((tab) => tab.widgets)
          .map((widget) => [widget.id, widget]),
      ),
    [pageLayoutPersisted],
  );

  const dashboardFilterWidgets = useMemo(
    () =>
      getDashboardFilterWidgets({
        tabs: pageLayoutDraft.tabs,
        persistedWidgetsById,
        objectMetadataItemsById: objectMetadataItemsByIdMap,
        viewsById: viewsByIdMap,
        recordTableWidgetViewDrafts: recordTableWidgetViewDraft,
        currentWorkspace,
      }),
    [
      pageLayoutDraft.tabs,
      persistedWidgetsById,
      objectMetadataItemsByIdMap,
      viewsByIdMap,
      recordTableWidgetViewDraft,
      currentWorkspace,
    ],
  );

  return useMemo(
    () =>
      getDashboardFilterWidgetRows({
        pageLayoutFilter,
        dashboardFilterWidgets,
      }),
    [pageLayoutFilter, dashboardFilterWidgets],
  );
};
