import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

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
      <SkeletonLine width={120} height={SKELETON_HEIGHT_SIZES.m} />
    </StyledContainer>
  );
};
