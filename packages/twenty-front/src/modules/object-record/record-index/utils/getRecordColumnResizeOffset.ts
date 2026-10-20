import { type TextDirection } from 'twenty-shared/translations';

type GetRecordColumnResizeOffsetParams = {
  pointerDeltaX: number;
  uiZoom: number;
  textDirection: TextDirection;
};

export const getRecordColumnResizeOffset = ({
  pointerDeltaX,
  uiZoom,
  textDirection,
}: GetRecordColumnResizeOffsetParams) =>
  ((textDirection === 'rtl' ? -1 : 1) * pointerDeltaX) / uiZoom;
