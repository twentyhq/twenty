import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

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
        <RecoilScope SpecificContext={TableRecoilScopeContext}>
          <StyledTableContainer>
            <CompanyTableMockMode />
          </StyledTableContainer>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
