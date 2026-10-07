import { type CSSWidth } from '@/ui/types/CSSWidth';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
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
      <Skeleton
        height={16}
        style={{ lineHeight: 0 }}
        width={width}
        baseColor={themeCssVariables.background.quaternary}
        highlightColor={themeCssVariables.background.secondary}
      />
    </StyledDropdownMenuSkeletonContainer>
  );
};
