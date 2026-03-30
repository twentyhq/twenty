import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';

import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { MainContainerLayoutWithSidePanel } from '@/object-record/components/MainContainerLayoutWithSidePanel';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect';
import { RecordIndexEmptyStateNotShared } from '@/object-record/record-index/components/RecordIndexEmptyStateNotShared';
import { RecordIndexLoadBaseOnContextStoreEffect } from '@/object-record/record-index/components/RecordIndexLoadBaseOnContextStoreEffect';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { useHandleIndexIdentifierClick } from '@/object-record/record-index/hooks/useHandleIndexIdentifierClick';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';

const StyledIndexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordIndexContainerGater = () => {
  const store = useStore();
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const handleIndexRecordsLoaded = useCallback(() => {
    // TODO: find a better way to reset this state ?
    store.set(lastShowPageRecordIdState.atom, null);
  }, [store]);

  const { indexIdentifierUrl } = useHandleIndexIdentifierClick({
    objectMetadataItem,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(
    objectMetadataItem,
    recordIndexId,
  );

  return (
    <>
      <RecordIndexContextProvider
        value={{
          objectPermissionsByObjectMetadataId,
          recordIndexId,
          viewBarInstanceId: recordIndexId,
          objectNamePlural: objectMetadataItem.namePlural,
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem,
          onIndexRecordsLoaded: handleIndexRecordsLoaded,
          indexIdentifierUrl,
          recordFieldByFieldMetadataItemId,
          labelIdentifierFieldMetadataItem,
          fieldMetadataItemByFieldMetadataItemId,
          fieldDefinitionByFieldMetadataItemId,
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordComponentInstanceContextsWrapper
            componentInstanceId={recordIndexId}
          >
            <CommandMenuComponentInstanceContext.Provider
              value={{
                instanceId: getCommandMenuIdFromRecordIndexId(recordIndexId),
              }}
            >
              <PageTitle title={objectMetadataItem.labelPlural} />
              <RecordIndexPageHeader />
              <MainContainerLayoutWithSidePanel>
                <StyledIndexContainer
                  className={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
                >
                  {hasObjectReadPermissions ? (
                    <>
                      <RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect />
                      <RecordIndexContainer />
                    </>
                  ) : (
                    <RecordIndexEmptyStateNotShared />
                  )}
                </StyledIndexContainer>
              </MainContainerLayoutWithSidePanel>
            </CommandMenuComponentInstanceContext.Provider>
          </RecordComponentInstanceContextsWrapper>
          <RecordIndexLoadBaseOnContextStoreEffect />
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </>
  );
};
