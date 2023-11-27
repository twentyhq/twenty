import styled from '@emotion/styled';

import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { RecordTableScope } from '@/ui/object/record-table/scopes/RecordTableScope';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const SignInBackgroundMockContainer = () => {
  const tableScopeId = 'sign-in-background-mock-table';
  const viewScopeId = 'sign-in-background-mock-view';

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={() => {}}
      onViewFiltersChange={() => {}}
      onViewSortsChange={() => {}}
    >
      <StyledContainer>
        <RecordTableScope
          recordTableScopeId={tableScopeId}
          onColumnsChange={() => {}}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <SignInBackgroundMockContainerEffect />
          <RecordTable updateEntityMutation={() => {}} />
        </RecordTableScope>
      </StyledContainer>
    </ViewScope>
  );
};
