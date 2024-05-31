import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonDiv = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  height: 24px;
`;
export const PropertyBoxSkeletonLoader = () => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: 4 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      {skeletonItems.map(({ id }) => (
        <StyledSkeletonDiv key={id}>
          <Skeleton width={92} height={16} />
          <Skeleton width={154} height={16} />
        </StyledSkeletonDiv>
      ))}
    </SkeletonTheme>
  );
};
