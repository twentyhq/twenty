import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type DragDropItemDropLineOrientation = 'horizontal' | 'vertical';

// Absolutely positioned in the gap before its (position: relative) parent so
// activating the drop target does not reflow the list. Horizontal draws above
// the item (vertical lists); vertical draws on its left (horizontal lists).
const StyledDropLineContainer = styled.div<{
  $orientation: DragDropItemDropLineOrientation;
}>`
  bottom: ${({ $orientation }) => ($orientation === 'vertical' ? '0' : 'auto')};
  left: ${({ $orientation }) =>
    $orientation === 'vertical'
      ? `calc(-1 * ${themeCssVariables.spacing[1]})`
      : '0'};
  position: absolute;
  right: ${({ $orientation }) => ($orientation === 'vertical' ? 'auto' : '0')};
  top: ${({ $orientation }) =>
    $orientation === 'vertical'
      ? '0'
      : `calc(-1 * ${themeCssVariables.spacing[2]})`};
`;

const StyledDropLine = styled.div<{
  $orientation: DragDropItemDropLineOrientation;
}>`
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${({ $orientation }) =>
    $orientation === 'vertical' ? '100%' : '2px'};
  width: ${({ $orientation }) =>
    $orientation === 'vertical' ? '2px' : '100%'};
`;

type DragDropItemDropLineProps = {
  orientation?: DragDropItemDropLineOrientation;
};

export const DragDropItemDropLine = ({
  orientation = 'horizontal',
}: DragDropItemDropLineProps) => (
  <StyledDropLineContainer $orientation={orientation}>
    <StyledDropLine $orientation={orientation} />
  </StyledDropLineContainer>
);
