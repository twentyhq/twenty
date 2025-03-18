import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';

import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';

import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { ShowPageSubContainer } from '@/ui/layout/show-page/components/ShowPageSubContainer';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { ActiveTabComponentInstanceContext } from '@/ui/layout/tab/states/contexts/ActiveTabComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

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

  const { layout, tabs } = useRecordShowContainerTabs(
    loading,
    objectNameSingular as CoreObjectNameSingular,
    isInRightDrawer,
    objectMetadataItem,
  );

  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );

  const tabListComponentId = getShowPageTabListComponentId({
    pageId: commandMenuPageComponentInstance?.instanceId,
    targetObjectId: objectRecordId,
  });

  return (
    <>
      <RecordShowContainerContextStoreTargetedRecordsEffect
        recordId={objectRecordId}
      />
      {recordFromStore && recordFromStore.deletedAt && (
        <InformationBannerDeletedRecord
          recordId={objectRecordId}
          objectNameSingular={objectNameSingular}
        />
      )}
      <ShowPageContainer>
        <ActiveTabComponentInstanceContext.Provider
          value={{ instanceId: tabListComponentId }}
        >
          <ShowPageSubContainer
            tabs={tabs}
            layout={layout}
            targetableObject={{
              id: objectRecordId,
              targetObjectNameSingular: objectMetadataItem?.nameSingular,
            }}
            isInRightDrawer={isInRightDrawer}
            loading={isPrefetchLoading || loading || recordLoading}
            isNewRightDrawerItemLoading={isNewRightDrawerItemLoading}
          />
        </ActiveTabComponentInstanceContext.Provider>
      </ShowPageContainer>
    </>
  );
};
