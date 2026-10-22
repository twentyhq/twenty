import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { DATE_PICKER_CONTAINER_WIDTH } from '@/ui/input/components/internal/date/constants/DatePickerContainerWidth';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const DATE_PICKER_SKELETON_HEIGHT = 300;
const DATE_PICKER_SKELETON_PADDING = 16;
const DATE_PICKER_SKELETON_BORDER_RADIUS = 2;
const DATE_PICKER_SKELETON_ROW_COUNT = 4;

const StyledFallback = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: ${DATE_PICKER_SKELETON_HEIGHT}px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  width: ${DATE_PICKER_CONTAINER_WIDTH}px;
`;

type DatePickerLoadingFallbackProps = {
  children?: ReactNode;
};

export const DatePickerLoadingFallback = ({
  children,
}: DatePickerLoadingFallbackProps) => (
  <StyledFallback>
    {children ??
      Array.from({ length: DATE_PICKER_SKELETON_ROW_COUNT }, (_, index) => (
        <SkeletonLine
          key={index}
          width={DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING}
          height={SKELETON_HEIGHT_SIZES.l}
          borderRadius={DATE_PICKER_SKELETON_BORDER_RADIUS}
        />
      ))}
  </StyledFallback>
);
