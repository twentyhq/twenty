import styled from '@emotion/styled';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
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

  return (
    <StyledContainer>
      <ViewComponentInstanceContext.Provider value={{ instanceId: viewBarId }}>
        <ContextStoreComponentInstanceContext.Provider
          value={{
            instanceId: recordIndexId,
          }}
        >
          <ActionMenuComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <ViewBar
              viewBarId={viewBarId}
              onCurrentViewChange={async () => {}}
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
    </StyledContainer>
  );
};
