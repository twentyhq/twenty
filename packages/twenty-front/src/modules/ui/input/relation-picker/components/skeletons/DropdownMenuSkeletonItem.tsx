import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { type CSSWidth } from '@/ui/types/CSSWidth';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${themeCssVariables.spacing[1]};
  --vertical-padding: ${themeCssVariables.spacing[2]};

  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  flex-shrink: 0;

  gap: ${themeCssVariables.spacing[2]};

  height: ${themeCssVariables.spacing[8]};
  padding-inline-start: var(--horizontal-padding);

  padding-inline-end: var(--horizontal-padding);
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
