import { type Placement } from '@floating-ui/react';
import { type MenuAlign, type MenuSide } from 'twenty-ui/primitives/surfaces';

export const getDropdownMenuPlacement = (
  placement: Placement,
): {
  side: MenuSide;
  align: MenuAlign;
} => {
  const [side, align = 'center'] = placement.split('-');

  return { side: side as MenuSide, align: align as MenuAlign };
};
