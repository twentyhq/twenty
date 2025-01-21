import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonContainer = styled.div`
  align-items: flex-start;

  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 196px;
  max-width: 196px;
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
        {title && (
          <Skeleton
            width={48}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
          />
        )}
        {Array.from({ length }).map((_, index) => (
          <Skeleton
            key={index}
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        ))}
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};
