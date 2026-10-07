import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const WidgetSkeletonLoader = () => {
  return (
    <StyledContainer>
      <Skeleton width={120} height={SKELETON_HEIGHT_SIZES.m} />
    </StyledContainer>
  );
};
