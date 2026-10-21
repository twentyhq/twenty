import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export const MainNavigationDrawerItemsSkeletonLoader = ({
  title,
  length,
}: {
  title?: boolean;
  length: number;
}) => {
  return (
    <StyledSkeletonContainer>
      {title && <SkeletonLine width={48} height={SKELETON_HEIGHT_SIZES.xs} />}
      {Array.from({ length }).map((_, index) => (
        <SkeletonLine key={index} height={SKELETON_HEIGHT_SIZES.s} />
      ))}
    </StyledSkeletonContainer>
  );
};
