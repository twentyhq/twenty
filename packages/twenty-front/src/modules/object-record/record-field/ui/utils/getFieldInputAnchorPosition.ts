import { type ComponentProps, type RefObject } from 'react';
import { type Dropdown } from 'twenty-ui/components';

import { getFloatingReferenceScale } from '@/ui/layout/overlay/utils/getFloatingReferenceScale';

type FieldInputAnchorPosition = Pick<
  ComponentProps<typeof Dropdown.Content>,
  'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding'
> & { anchorRef: RefObject<Element | null> };

export const getFieldInputAnchorPosition = ({
  anchorRef,
  sideOffset,
  alignOffset,
  align = 'start',
  collisionPadding,
}: Omit<FieldInputAnchorPosition, 'sideOffset' | 'alignOffset'> & {
  sideOffset: number;
  alignOffset: number;
}): FieldInputAnchorPosition => ({
  anchorRef,
  align,
  collisionPadding,
  sideOffset: ({ anchor }) =>
    sideOffset *
    getFloatingReferenceScale({
      rects: { reference: anchor },
      elements: { reference: anchorRef.current },
    }),
  alignOffset: ({ anchor }) =>
    alignOffset *
    getFloatingReferenceScale({
      rects: { reference: anchor },
      elements: { reference: anchorRef.current },
    }),
});
