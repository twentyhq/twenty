import styled from '@emotion/styled';

import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableRecoilScopeContext } from '@/ui/Data/Data Table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { IconBuildingSkyscraper } from '@/ui/Display/Icon';
import { PageBody } from '@/ui/Layout/Page/PageBody';
import { PageContainer } from '@/ui/Layout/Page/PageContainer';
import { PageHeader } from '@/ui/Layout/Page/PageHeader';
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
