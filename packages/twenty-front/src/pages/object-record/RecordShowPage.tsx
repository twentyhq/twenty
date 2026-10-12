import { Navigate, useParams } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';
import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';
import {
  type RecordShowPageParameters,
  RecordShowPageContent,
} from '~/pages/object-record/RecordShowPageContent';

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

  if (
    parameters.objectNameSingular === CoreObjectNameSingular.AgentChatThread &&
    isDefined(parameters.objectRecordId)
  ) {
    // A chat's record page is the chat page, on its own route
    if (!isInSidePanel) {
      return (
        <Navigate
          replace
          to={getAppPath(AppPath.AiChat, {
            threadId: parameters.objectRecordId,
          })}
        />
      );
    }

    return <AiChatThreadPageContent threadId={parameters.objectRecordId} />;
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
