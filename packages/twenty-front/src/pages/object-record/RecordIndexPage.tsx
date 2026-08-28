import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { isCoreWorkflowsIndexEnabled } from '@/object-core/workflows/utils/isCoreWorkflowsIndexEnabled';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isUndefined } from '@sniptt/guards';
import { lazy, Suspense } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

const WorkflowCoreIndexPage = lazy(() =>
  import('~/pages/object-core/WorkflowCoreIndexPage').then((module) => ({
    default: module.WorkflowCoreIndexPage,
  })),
);

export const RecordIndexPage = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

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
    isCoreWorkflowsIndexEnabled({
      objectNameSingular: objectMetadataItem.nameSingular,
      isWorkflowCoreIndexPageEnabled,
    })
  ) {
    return (
      <Suspense fallback={<RecordIndexSkeletonLoader />}>
        <WorkflowCoreIndexPage />
      </Suspense>
    );
  }

  return (
    <PageContainer>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }}
      >
        <RecordIndexContainerGater />
      </ContextStoreComponentInstanceContext.Provider>
    </PageContainer>
  );
};
