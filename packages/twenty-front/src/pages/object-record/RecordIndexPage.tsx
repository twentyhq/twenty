import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { isUndefined } from '@sniptt/guards';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

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

  const location = useLocation();

  const routeObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );

  if (objectNamePlural === CoreObjectNamePlural.Workflow) {
    return (
      <Navigate
        replace
        to={{ pathname: AppPath.WorkflowIndexPage, search: location.search }}
      />
    );
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

  if (workspaceSurface.type === 'side-panel') {
    return <RecordIndexContainerGater />;
  }

  return (
    <PageContainer>
      <RecordIndexContainerGater />
    </PageContainer>
  );
};
