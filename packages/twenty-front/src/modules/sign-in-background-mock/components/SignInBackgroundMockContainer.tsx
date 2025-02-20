import styled from '@emotion/styled';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

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

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    'main-context-store',
  );

  return (
    <StyledContainer>
      <RecordIndexContextProvider
        value={{
          recordIndexId,
          objectNamePlural,
          objectNameSingular,
          objectMetadataItem: objectMetadataItem ?? objectMetadataItems[0],
          onIndexRecordsLoaded: () => {},
          indexIdentifierUrl: () => '',
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <RecordSortsComponentInstanceContext.Provider
              value={{ instanceId: recordIndexId }}
            >
              <ContextStoreComponentInstanceContext.Provider
                value={{
                  instanceId: 'main-context-store',
                }}
              >
                <SignInBackgroundMockContainerEffect
                  objectNamePlural={objectNamePlural}
                  recordTableId={recordIndexId}
                  viewId={viewBarId}
                />
                <ActionMenuComponentInstanceContext.Provider
                  value={{ instanceId: recordIndexId }}
                >
                  {isDefined(objectMetadataItem) && (
                    <>
                      <ViewBar
                        viewBarId={viewBarId}
                        optionsDropdownButton={<></>}
                      />

                      <RecordTableWithWrappers
                        objectNameSingular={objectNameSingular}
                        recordTableId={recordIndexId}
                        viewBarId={viewBarId}
                        updateRecordMutation={() => {}}
                      />
                    </>
                  )}
                </ActionMenuComponentInstanceContext.Provider>
              </ContextStoreComponentInstanceContext.Provider>
            </RecordSortsComponentInstanceContext.Provider>
          </RecordFiltersComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </StyledContainer>
  );
};
