import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(32px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const DropdownMenuSkeletonItem = () => {
  const theme = useTheme();
  return (
    <StyledDropdownMenuSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.quaternary}
        highlightColor={theme.background.secondary}
      >
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
      </SkeletonTheme>
    </StyledDropdownMenuSkeletonContainer>
  );
};
