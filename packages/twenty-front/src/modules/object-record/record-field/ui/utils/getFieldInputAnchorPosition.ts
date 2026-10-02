import { type FieldInputAnchorPosition } from '@/object-record/record-field/ui/types/FieldInputAnchorPosition';
import { getFloatingReferenceScale } from '@/ui/layout/overlay/utils/getFloatingReferenceScale';

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
