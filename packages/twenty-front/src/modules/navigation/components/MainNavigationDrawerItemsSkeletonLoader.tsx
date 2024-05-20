import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 12px;
  margin-top: 8px;
`;

export const MainNavigationDrawerItemsSkeletonLoader = ({
  title,
  length,
}: {
  title?: boolean;
  length: number;
}) => {
  const theme = useTheme();
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        {title && <Skeleton width={48} height={13} />}
        {Array.from({ length }).map((_, index) => (
          <Skeleton key={index} width={196} height={16} />
        ))}
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};
