import styled from '@emotion/styled';
import { BACKGROUND_LIGHT, GRAY_SCALE } from 'twenty-ui';
import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledRightDrawerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSkeletonLoader = () => {
  return (
    <SkeletonTheme
      baseColor={GRAY_SCALE.gray15}
      highlightColor={BACKGROUND_LIGHT.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} width={140} />
    </SkeletonTheme>
  );
};

export const RightDrawerSkeletonLoader = () => {
  return (
    <StyledRightDrawerContainer>
      <StyledSkeletonLoader />
    </StyledRightDrawerContainer>
  );
};
