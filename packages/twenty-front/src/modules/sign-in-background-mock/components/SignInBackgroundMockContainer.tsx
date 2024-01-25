import styled from '@emotion/styled';

import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { TableOptionsDropdownId } from '@/object-record/record-table/constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '@/object-record/record-table/options/components/TableOptionsDropdown';
import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { ViewBar } from '@/views/components/ViewBar';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const SignInBackgroundMockContainer = () => {
  const objectNamePlural = 'companies';
  const recordTableId = 'sign-up-mock-record-table-id';
  const viewBarId = 'companies-mock';

  return (
    <StyledContainer>
      <ViewBar
        viewBarId={viewBarId}
        optionsDropdownButton={
          <TableOptionsDropdown recordTableId={recordTableId} />
        }
        optionsDropdownScopeId={TableOptionsDropdownId}
      />
      <SignInBackgroundMockContainerEffect
        objectNamePlural={objectNamePlural}
        recordTableId={recordTableId}
        viewId={viewBarId}
      />
      <RecordTableWithWrappers
        objectNamePlural={objectNamePlural}
        recordTableId={recordTableId}
        viewBarId={viewBarId}
        createRecord={async () => {}}
        updateRecordMutation={() => {}}
      />
    </StyledContainer>
  );
};
