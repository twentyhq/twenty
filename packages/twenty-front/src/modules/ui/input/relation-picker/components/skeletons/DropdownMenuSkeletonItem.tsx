import { type CSSWidth } from '@/ui/types/CSSWidth';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSkeletonContainer = styled.div`
  --horizontal-padding: ${themeCssVariables.spacing[1]};
  --vertical-padding: ${themeCssVariables.spacing[2]};

  border-radius: ${themeCssVariables.border.radius.sm};
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
        variant="text"
        height={16}
        width={width}
      />
    </StyledDropdownMenuSkeletonContainer>
  );
};
