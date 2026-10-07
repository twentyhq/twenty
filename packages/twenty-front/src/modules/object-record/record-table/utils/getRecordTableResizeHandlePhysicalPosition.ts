import { type TextDirection } from 'twenty-shared/translations';

type GetRecordTableResizeHandlePhysicalPositionParams = {
  position: 'left' | 'right';
  textDirection: TextDirection;
};

// `position` names the handle's edge in reading order: 'left' is the start edge,
// shared with the previous column, and 'right' is the end edge. In RTL the table
// is mirrored, so each handle sits on the opposite physical side.
export const getRecordTableResizeHandlePhysicalPosition = ({
  position,
  textDirection,
}: GetRecordTableResizeHandlePhysicalPositionParams): 'left' | 'right' => {
  if (textDirection === 'ltr') {
    return position;
  }

  return position === 'left' ? 'right' : 'left';
};
