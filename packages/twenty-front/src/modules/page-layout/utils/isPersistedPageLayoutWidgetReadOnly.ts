import { isThirdPartyApplication } from '@/applications/utils/isThirdPartyApplication';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';

// Takes the persisted widget: an unsaved copy of an app's widget becomes workspace-owned on save
export const isPersistedPageLayoutWidgetReadOnly = ({
  persistedWidget,
  currentWorkspace,
}: {
  persistedWidget: Pick<PageLayoutWidget, 'applicationId'> | undefined;
  currentWorkspace: Pick<
    CurrentWorkspace,
    'installedApplications' | 'workspaceCustomApplication'
  > | null;
}): boolean =>
  isDefined(persistedWidget) &&
  isThirdPartyApplication({
    application: currentWorkspace?.installedApplications.find(
      ({ id }) => id === persistedWidget.applicationId,
    ),
    currentWorkspace,
  });
