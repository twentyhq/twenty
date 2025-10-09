import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

const StyledSkeletonGreyBox = styled.div<{ isInRightDrawer?: boolean }>`
  background: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.background.secondary : ''};
  border: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? `1px solid ${theme.border.color.medium}` : ''};
  border-radius: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.border.radius.md : ''};
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};
  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;
const StyledLoadingSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const FieldCardSkeleton = ({
  isInRightDrawer,
}: {
  isInRightDrawer?: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledSkeletonGreyBox isInRightDrawer={isInRightDrawer}>
      <StyledLoadingSkeletonContainer>
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={theme.border.radius.sm}
        >
          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
            width="60%"
          />
          <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
          <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
          <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
        </SkeletonTheme>
      </StyledLoadingSkeletonContainer>
    </StyledSkeletonGreyBox>
  );
};
