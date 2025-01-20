import styled from '@emotion/styled';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  return (
    <StyledContainer>
      <RecordIndexContextProvider
        value={{
          recordIndexId,
          objectNamePlural,
          objectNameSingular,
          objectMetadataItem,
          onIndexRecordsLoaded: () => {},
          indexIdentifierUrl: () => '',
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: recordIndexId }}
            >
              <ViewBar
                viewBarId={viewBarId}
                onCurrentViewChange={() => {}}
                optionsDropdownButton={<></>}
              />
              <SignInBackgroundMockContainerEffect
                objectNamePlural={objectNamePlural}
                recordTableId={recordIndexId}
                viewId={viewBarId}
              />
              <RecordTableWithWrappers
                objectNameSingular={objectNameSingular}
                recordTableId={recordIndexId}
                viewBarId={viewBarId}
                updateRecordMutation={() => {}}
              />
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </StyledContainer>
  );
};
