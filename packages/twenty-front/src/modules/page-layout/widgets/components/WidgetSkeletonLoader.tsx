import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const WidgetSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton
          width={120}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
        />
      </SkeletonTheme>
    </StyledContainer>
  );
};
