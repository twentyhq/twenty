import { type TextDirection } from 'twenty-shared/translations';

type GetRecordTableColumnResizeOffsetParams = {
  pointerDeltaX: number;
  uiZoom: number;
  textDirection: TextDirection;
};

// A column grows when its end edge moves outward: rightward in LTR and
// leftward in RTL, where the table is mirrored.
export const getRecordTableColumnResizeOffset = ({
  pointerDeltaX,
  uiZoom,
  textDirection,
}: GetRecordTableColumnResizeOffsetParams) =>
  ((textDirection === 'rtl' ? -1 : 1) * pointerDeltaX) / uiZoom;
