import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';
import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';
import {
  type RecordShowPageParameters,
  RecordShowPageContent,
} from '~/pages/object-record/RecordShowPageContent';

export const RecordShowPage = () => {
  const parameters = useParams<RecordShowPageParameters>();
  const workspaceSurface = useWorkspaceSurface();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const routeObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === parameters.objectNameSingular,
  );
  const isRouteObjectMetadataAvailable = isDefined(routeObjectMetadataItem);

  if (isInSidePanel && !isRouteObjectMetadataAvailable) {
    return <WorkspaceRouteUnavailable />;
  }

  if (
    routeObjectMetadataItem?.universalIdentifier ===
      STANDARD_OBJECTS.agentChatThread.universalIdentifier &&
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
    })
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  const CoreObjectShowPage = findCoreObjectShowPage(
    parameters.objectNameSingular,
  );

  if (isDefined(CoreObjectShowPage) && isDefined(parameters.objectRecordId)) {
    return <CoreObjectShowPage objectRecordId={parameters.objectRecordId} />;
  }

  return <RecordShowPageContent parameters={parameters} />;
};
