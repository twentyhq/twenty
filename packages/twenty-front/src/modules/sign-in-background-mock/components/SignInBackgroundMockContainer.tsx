import styled from '@emotion/styled';

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
      </ViewComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
