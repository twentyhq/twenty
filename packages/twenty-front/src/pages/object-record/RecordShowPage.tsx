import { useParams } from 'react-router-dom';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { WorkspaceWorkflowRedirect } from '@/object-core/workflows/components/WorkspaceWorkflowRedirect';
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

const WorkspaceRecordShowPageContent = ({
  parameters,
}: {
  parameters: RecordShowPageParameters;
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

  if (
    isWorkspaceWorkflowVersionRouteHidden({
      objectNameSingular: parameters.objectNameSingular,
      isWorkflowCoreIndexPageEnabled,
    })
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  if (
    isWorkflowCoreIndexPageEnabled &&
    parameters.objectNameSingular === 'workflow' &&
    isDefined(parameters.objectRecordId)
  ) {
    return (
      <WorkspaceWorkflowRedirect
        workspaceWorkflowId={parameters.objectRecordId}
      />
    );
  }

  return <WorkspaceRecordShowPageContent parameters={parameters} />;
};
