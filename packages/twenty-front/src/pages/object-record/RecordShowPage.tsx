import { type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';
import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordShowPageShell } from '@/object-record/record-show/components/RecordShowPageShell';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type RecordShowPageParameters = {
  objectNameSingular?: string;
  objectRecordId?: string;
};

export const RecordShowPageContent = ({
  parameters,
  headerActions,
}: {
  parameters: RecordShowPageParameters;
  headerActions?: ReactNode;
}) => {
  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const { error, loading, record } = useRecordShowPageResource({
    objectNameSingular,
    recordId: objectRecordId,
  });

  return (
    <RecordShowPageShell
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
      record={record}
      loading={loading}
      error={error}
      headerActions={headerActions}
    />
  );
};

export const RecordShowPage = () => {
  const parameters = useParams<RecordShowPageParameters>();
  const workspaceSurface = useWorkspaceSurface();
  const { objectMetadataItems } = useObjectMetadataItems();
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const isRouteObjectMetadataAvailable =
    isDefined(parameters.objectNameSingular) &&
    objectMetadataItems.some(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === parameters.objectNameSingular,
    );

  if (isInSidePanel && !isRouteObjectMetadataAvailable) {
    return <WorkspaceRouteUnavailable />;
  }

  // A chat's record page is the chat page, on its own route
  if (
    !isInSidePanel &&
    parameters.objectNameSingular === CoreObjectNameSingular.AgentChatThread &&
    isDefined(parameters.objectRecordId)
  ) {
    return (
      <Navigate
        replace
        to={getAppPath(AppPath.AiChat, {
          threadId: parameters.objectRecordId,
        })}
      />
    );
  }

  if (
    isWorkspaceWorkflowVersionRouteHidden({
      objectNameSingular: parameters.objectNameSingular,
      isWorkflowCoreIndexPageEnabled,
    })
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  const CoreObjectShowPage = isWorkflowCoreIndexPageEnabled
    ? findCoreObjectShowPage(parameters.objectNameSingular)
    : undefined;

  if (isDefined(CoreObjectShowPage) && isDefined(parameters.objectRecordId)) {
    return <CoreObjectShowPage objectRecordId={parameters.objectRecordId} />;
  }

  return <RecordShowPageContent parameters={parameters} />;
};
