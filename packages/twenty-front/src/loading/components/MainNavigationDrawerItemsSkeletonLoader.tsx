import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

const StyledSkeletonContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const fillSkeletonContainer = css`
  display: block;
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
      {title && <Skeleton width={48} height={SKELETON_HEIGHT_SIZES.xs} />}
      {Array.from({ length }).map((_, index) => (
        <Skeleton
          key={index}
          className={fillSkeletonContainer}
          height={SKELETON_HEIGHT_SIZES.s}
        />
      ))}
    </StyledSkeletonContainer>
  );
};
