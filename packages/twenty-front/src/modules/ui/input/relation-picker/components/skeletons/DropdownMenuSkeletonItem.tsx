import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { type CSSWidth } from '@/ui/types/CSSWidth';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${themeCssVariables.spacing[1]};

  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  padding-left: var(--horizontal-padding);
  padding-right: var(--horizontal-padding);
`;

export const DropdownMenuSkeletonItem = ({
  width = '100%',
}: {
  width?: CSSWidth;
}) => {
  return (
    <StyledDropdownMenuSkeletonContainer>
      <SkeletonLine
        height={SKELETON_HEIGHT_SIZES.s}
        width={width}
        baseColor={themeCssVariables.background.quaternary}
        highlightColor={themeCssVariables.background.secondary}
      />
    </StyledDropdownMenuSkeletonContainer>
  );
};
