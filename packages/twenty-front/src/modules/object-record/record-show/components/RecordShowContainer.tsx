import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';

import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { MainContextStoreComponentInstanceIdSetterEffect } from '@/context-store/components/MainContextStoreComponentInstanceIdSetterEffect';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';
import { RecordShowContainerContextStoreEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreEffect';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { ShowPageSubContainer } from '@/ui/layout/show-page/components/ShowPageSubContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
  loading: boolean;
  isInRightDrawer?: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
  loading,
  isInRightDrawer = false,
  isNewRightDrawerItemLoading = false,
}: RecordShowContainerProps) => {
  const {
    recordFromStore,
    objectMetadataItem,
    isPrefetchLoading,
    recordLoading,
  } = useRecordShowContainerData({
    objectNameSingular,
    objectRecordId,
  });

  const tabs = useRecordShowContainerTabs(
    loading,
    objectNameSingular as CoreObjectNameSingular,
    isInRightDrawer,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
    `record-show-${objectRecordId}`,
  );

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{
        instanceId: `record-show-${objectRecordId}`,
      }}
    >
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: `record-show-${objectRecordId}` }}
      >
        <RecordShowContainerContextStoreEffect
          recordId={objectRecordId}
          objectNameSingular={objectNameSingular}
        />
        {!isInRightDrawer && (
          <MainContextStoreComponentInstanceIdSetterEffect />
        )}
        {contextStoreCurrentObjectMetadataId && (
          <>
            <ActionMenuConfirmationModals />
            <RecordActionMenuEntriesSetter
              actionMenuType={
                isInRightDrawer ? 'recordShowInRightDrawer' : 'recordShow'
              }
            />
          </>
        )}
        {recordFromStore && recordFromStore.deletedAt && (
          <InformationBannerDeletedRecord
            recordId={objectRecordId}
            objectNameSingular={objectNameSingular}
          />
        )}
        <ShowPageContainer>
          <ShowPageSubContainer
            tabs={tabs}
            targetableObject={{
              id: objectRecordId,
              targetObjectNameSingular: objectMetadataItem?.nameSingular,
            }}
            isInRightDrawer={isInRightDrawer}
            loading={isPrefetchLoading || loading || recordLoading}
            isNewRightDrawerItemLoading={isNewRightDrawerItemLoading}
          />
        </ShowPageContainer>
      </ActionMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
