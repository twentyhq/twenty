import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 76px;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const ObjectMetadataNavItemsSkeletonLoader: React.FC = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.light}
      borderRadius={4}
    >
      <StyledSkeletonColumn>
        <Skeleton width={196} height={16} />
        <Skeleton width={196} height={16} />
        <Skeleton width={196} height={16} />
      </StyledSkeletonColumn>
    </SkeletonTheme>
  );
};
