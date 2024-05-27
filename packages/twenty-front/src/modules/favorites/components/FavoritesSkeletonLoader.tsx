import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 71px;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const FavoritesSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton width={56} height={13} />
        <StyledSkeletonColumn>
          <Skeleton width={196} height={16} />
          <Skeleton width={196} height={16} />
        </StyledSkeletonColumn>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
