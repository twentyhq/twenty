import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { isPersistedPageLayoutWidgetReadOnly } from '@/page-layout/utils/isPersistedPageLayoutWidgetReadOnly';

export const isPageLayoutFilterBoundByReadOnlyWidget = ({
  pageLayoutFilterId,
  persistedWidgets,
  currentWorkspace,
}: {
  pageLayoutFilterId: string;
  persistedWidgets: Pick<PageLayoutWidget, 'applicationId' | 'configuration'>[];
  currentWorkspace: Pick<
    CurrentWorkspace,
    'installedApplications' | 'workspaceCustomApplication'
  > | null;
}): boolean =>
  persistedWidgets.some(
    (persistedWidget) =>
      getWidgetDashboardFilterBindings(persistedWidget.configuration).some(
        (binding) => binding.pageLayoutFilterId === pageLayoutFilterId,
      ) &&
      isPersistedPageLayoutWidgetReadOnly({
        persistedWidget,
        currentWorkspace,
      }),
  );
