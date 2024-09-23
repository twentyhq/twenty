import { PageBody } from '@/ui/layout/page/PageBody';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import styled from '@emotion/styled';
import Skeleton from 'react-loading-skeleton';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTitleLoaderContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(8, 8, 2)};
`;

export const SettingsSkeletonLoader = () => {
  return (
    <StyledContainer>
      <PageHeader title={<></>}>
        <Skeleton height={20} width={120} />
      </PageHeader>
      <PageBody>
        <StyledTitleLoaderContainer>
          <Skeleton height={20} width={220} />
        </StyledTitleLoaderContainer>
      </PageBody>
    </StyledContainer>
  );
};
