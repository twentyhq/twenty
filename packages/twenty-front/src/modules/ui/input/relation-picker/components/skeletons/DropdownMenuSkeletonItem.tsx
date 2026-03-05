import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { type CSSWidth } from '@/ui/types/CSSWidth';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${themeCssVariables.spacing[1]};
  --vertical-padding: ${themeCssVariables.spacing[2]};

  border-radius: ${themeCssVariables.border.radius.sm};
  gap: ${themeCssVariables.spacing[2]};
  box-sizing: border-box;

  flex-shrink: 0;

  padding-left: var(--horizontal-padding);
  padding-right: var(--horizontal-padding);

  height: ${themeCssVariables.spacing[8]};
`;

export const DropdownMenuSkeletonItem = ({
  width = '100%',
}: {
  width?: CSSWidth;
}) => {
  const { theme } = useContext(ThemeContext);
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
