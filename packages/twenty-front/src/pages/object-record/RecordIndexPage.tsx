import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';

export const RecordIndexPage = () => {
  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const objectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  if (
    isUndefined(objectMetadataItem) ||
    !isNonEmptyString(contextStoreCurrentViewId)
  ) {
    return null;
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
