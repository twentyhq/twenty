import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';

import { TableActionBarButtonCreateCommentThreadCompany } from './table/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';
import { CompanyTableMockMode } from './CompanyTableMockMode';

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
