import styled from '@emotion/styled';

import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const CompaniesMockMode = () => {
  return (
    <PageContainer>
      <PageHeader title="Companies" Icon={IconBuildingSkyscraper} />
      <PageBody>
        <StyledTableContainer></StyledTableContainer>
      </PageBody>
    </PageContainer>
  );
};
