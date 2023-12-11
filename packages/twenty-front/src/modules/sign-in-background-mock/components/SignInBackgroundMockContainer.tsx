import styled from '@emotion/styled';

import { RecordTable } from '@/object-record/record-table/components/RecordTable';
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
  const recordTableId = 'companies';
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
        recordTableId={recordTableId}
        viewId={viewBarId}
      />
      <RecordTable
        recordTableId={recordTableId}
        viewBarId={viewBarId}
        createRecord={() => {}}
        updateRecordMutation={() => {}}
      />
    </StyledContainer>
  );
};
