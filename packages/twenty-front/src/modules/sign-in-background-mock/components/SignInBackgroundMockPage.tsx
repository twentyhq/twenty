import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';

import { SignInBackgroundMockContainer } from '@/sign-in-background-mock/components/SignInBackgroundMockContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconBuildingSkyscraper } from 'twenty-ui/display';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const SignInBackgroundMockPage = () => {
  return (
    <PageContainer>
      <PageHeader title={t`Companies`} Icon={IconBuildingSkyscraper} />
      <PageBody>
        <StyledTableContainer>
          <SignInBackgroundMockContainer />
        </StyledTableContainer>
      </PageBody>
    </PageContainer>
  );
};
