import styled from '@emotion/styled';

import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const CompaniesMockMode = () => {
  return (
    <PageContainer>
      <PageHeader title="Companies" Icon={IconBuildingSkyscraper} />
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={TableRecoilScopeContext}>
          <StyledTableContainer>
            <CompanyTableMockMode />
          </StyledTableContainer>
        </RecoilScope>
      </PageBody>
    </PageContainer>
  );
};
