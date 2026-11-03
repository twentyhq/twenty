import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isUndefined } from '@sniptt/guards';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const RecordIndexPage = () => {
  const workspaceSurface = useWorkspaceSurface();
  const { objectNamePlural } = useParams<{ objectNamePlural: string }>();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { objectMetadataItems } = useObjectMetadataItems();
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );

  const routeObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );

  if (objectNamePlural === CoreObjectNamePlural.Workflow) {
    return <Navigate replace to={getAppPath(AppPath.WorkflowCoreIndexPage)} />;
  }

  if (
    workspaceSurface.type === 'side-panel' &&
    metadataStore.status === 'empty'
  ) {
    return <RecordIndexSkeletonLoader />;
  }

  if (
    workspaceSurface.type === 'side-panel' &&
    !isUndefined(objectNamePlural) &&
    isUndefined(routeObjectMetadataItem)
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  if (isUndefined(contextStoreCurrentObjectMetadataItemId)) {
    return <RecordIndexSkeletonLoader />;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

  if (isUndefined(objectMetadataItem)) {
    return <RecordIndexSkeletonLoader />;
  }

  if (
    isWorkspaceWorkflowVersionRouteHidden({
      objectNameSingular: routeObjectMetadataItem?.nameSingular,
    })
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  if (workspaceSurface.type === 'side-panel') {
    return <RecordIndexContainerGater />;
  }

  return (
    <PageContainer>
      <RecordIndexContainerGater />
    </PageContainer>
  );
};
