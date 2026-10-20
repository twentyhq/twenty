import { type TextDirection } from 'twenty-shared/translations';

type GetRecordColumnResizeOffsetParams = {
  pointerDeltaX: number;
  uiZoom: number;
  textDirection: TextDirection;
};

// Columns grow toward the inline end, which is leftward in RTL.
export const getRecordColumnResizeOffset = ({
  pointerDeltaX,
  uiZoom,
  textDirection,
}: GetRecordColumnResizeOffsetParams) =>
  ((textDirection === 'rtl' ? -1 : 1) * pointerDeltaX) / uiZoom;
