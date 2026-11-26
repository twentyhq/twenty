import { themeCssVariables } from 'twenty-ui/theme';

export const getRecordTableCellHoveredOutlineColor = ({
  isRecordTableRowActive,
  showInteractiveStyle,
}: {
  isRecordTableRowActive: boolean;
  showInteractiveStyle: boolean;
}) => {
  if (isRecordTableRowActive) {
    return 'transparent';
  }

  if (showInteractiveStyle) {
    return themeCssVariables.font.color.extraLight;
  }

  return themeCssVariables.border.color.medium;
};
