import { styled } from '@linaria/react';

import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const SignInBackgroundMockContainer = () => {
  const objectNamePlural = 'companies';
  const objectNameSingular = 'company';
  const recordIndexId = 'sign-up-mock-record-table-id';
  const viewBarId = 'companies-mock';

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

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
    <StyledContainer>
      <RecordIndexContextProvider
        value={{
          objectPermissionsByObjectMetadataId: {},
          recordIndexId,
          viewBarInstanceId: recordIndexId,
          objectNamePlural,
          objectNameSingular,
          objectMetadataItem: objectMetadataItem ?? objectMetadataItems[0],
          onIndexRecordsLoaded: () => {},
          indexIdentifierUrl: () => '',
          fieldDefinitionByFieldMetadataItemId,
          fieldMetadataItemByFieldMetadataItemId,
          labelIdentifierFieldMetadataItem,
          recordFieldByFieldMetadataItemId,
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordComponentInstanceContextsWrapper
            componentInstanceId={recordIndexId}
          >
            <ContextStoreComponentInstanceContext.Provider
              value={{
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }}
            >
              <SignInBackgroundMockContainerEffect
                objectNamePlural={objectNamePlural}
                recordTableId={recordIndexId}
                viewId={viewBarId}
              />
              <CommandMenuComponentInstanceContext.Provider
                value={{ instanceId: recordIndexId }}
              >
                {isDefined(objectMetadataItem) && (
                  <>
                    <ViewBar
                      viewBarId={viewBarId}
                      optionsDropdownButton={<></>}
                      isReadOnly
                    />

                    <RecordTableWithWrappers
                      objectNameSingular={objectNameSingular}
                      recordTableId={recordIndexId}
                      viewBarId={viewBarId}
                    />
                  </>
                )}
              </CommandMenuComponentInstanceContext.Provider>
            </ContextStoreComponentInstanceContext.Provider>
          </RecordComponentInstanceContextsWrapper>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </StyledContainer>
  );
};
