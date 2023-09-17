import styled from '@emotion/styled';

import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
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
