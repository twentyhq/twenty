import styled from '@emotion/styled';

import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const SignInBackgroundMockContainer = () => {
  const recordTableId = 'sign-in-background-mock-table';
  const viewBarId = 'sign-in-background-mock-view';

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
