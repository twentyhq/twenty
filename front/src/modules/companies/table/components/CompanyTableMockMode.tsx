import styled from '@emotion/styled';

import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableOptionsDropdownId } from '@/ui/data/data-table/constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import CompanyTableEffect from './CompanyTableEffect';
import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const CompanyTableMockMode = () => {
  return (
    <StyledContainer>
      <ViewScope viewScopeId="company-table-mock-mode">
        <CompanyTableEffect />
        <CompanyTableMockDataEffect />
        <ViewBar
          optionsDropdownButton={<TableOptionsDropdown />}
          optionsDropdownScopeId={TableOptionsDropdownId}
        />

        <DataTable updateEntityMutation={useUpdateOneCompanyMutation} />
      </ViewScope>
    </StyledContainer>
  );
};
