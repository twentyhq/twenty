import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';

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
      {title && <Skeleton width={48} height={13} />}
      {Array.from({ length }).map((_, index) => (
        <Skeleton key={index} className={fillSkeletonContainer} height={16} />
      ))}
    </StyledSkeletonContainer>
  );
};
