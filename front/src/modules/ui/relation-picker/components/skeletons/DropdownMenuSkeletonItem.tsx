import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

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

export function DropdownMenuSkeletonItem() {
  const theme = useTheme();
  return (
    <StyledDropdownMenuSkeletonContainer>
      <SkeletonTheme highlightColor={theme.background.tertiary}>
        <Skeleton height={16} />
      </SkeletonTheme>
    </StyledDropdownMenuSkeletonContainer>
  );
}
