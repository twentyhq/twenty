import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconBuildingSkyscraper } from '@tabler/icons-react';

import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableActionBarButtonCreateCommentThreadCompany } from '@/companies/table/components/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from '@/companies/table/components/TableActionBarButtonDeleteCompanies';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function CompaniesMockMode() {
  const theme = useTheme();

  return (
    <>
      <WithTopBarContainer
        title="Companies"
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      >
        <RecoilScope SpecificContext={TableContext}>
          <StyledTableContainer>
            <CompanyTableMockMode />
          </StyledTableContainer>
          <EntityTableActionBar>
            <TableActionBarButtonCreateCommentThreadCompany />
            <TableActionBarButtonDeleteCompanies />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
