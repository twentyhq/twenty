import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { type CSSWidth } from '@/ui/types/CSSWidth';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  box-sizing: border-box;

  flex-shrink: 0;

  padding-left: var(--horizontal-padding);
  padding-right: var(--horizontal-padding);

  height: ${({ theme }) => theme.spacing(8)};
`;

export const DropdownMenuSkeletonItem = ({
  width = '100%',
}: {
  width?: CSSWidth;
}) => {
  const theme = useTheme();
  return (
    <StyledDropdownMenuSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.quaternary}
        highlightColor={theme.background.secondary}
      >
        <Skeleton
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          style={{ lineHeight: 0 }}
          width={width}
        />
      </SkeletonTheme>
    </StyledDropdownMenuSkeletonContainer>
  );
};
