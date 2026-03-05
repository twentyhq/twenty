import { styled } from '@linaria/react';

import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';
const StyledColorIcon = styled.div<{
  textColorValue: string;
  backgroundColorValue: string;
}>`
  background-color: ${({ backgroundColorValue }) => backgroundColorValue};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ textColorValue }) => textColorValue};
  font-size: 12px;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 16px;
  line-height: 16px;
  pointer-events: none;
  text-align: center;
  width: 16px;
`;

type DashboardColorIconProps = {
  textColor?: BlockNoteColor;
  backgroundColor?: BlockNoteColor;
};

export const DashboardColorIcon = ({
  textColor,
  backgroundColor,
}: DashboardColorIconProps) => {
  const getThemeColorForTextColor = (color: BlockNoteColor): string => {
    if (color === 'default') {
      return 'inherit';
    }
    return (
      resolveThemeVariable(
        (themeCssVariables.color as unknown as Record<string, string>)[color],
      ) ?? 'inherit'
    );
  };

  const getThemeColorForBackgroundColor = (color: BlockNoteColor): string => {
    if (color === 'default') {
      return 'transparent';
    }

    const backgroundColorMap: Record<
      Exclude<BlockNoteColor, 'default'>,
      string
    > = {
      gray: resolveThemeVariable(themeCssVariables.color.gray3),
      brown: resolveThemeVariable(themeCssVariables.color.brown3),
      red: resolveThemeVariable(themeCssVariables.color.red3),
      orange: resolveThemeVariable(themeCssVariables.color.orange3),
      yellow: resolveThemeVariable(themeCssVariables.color.yellow3),
      green: resolveThemeVariable(themeCssVariables.color.green3),
      blue: resolveThemeVariable(themeCssVariables.color.blue3),
      purple: resolveThemeVariable(themeCssVariables.color.purple3),
      pink: resolveThemeVariable(themeCssVariables.color.pink3),
    };

    return backgroundColorMap[color];
  };

  return (
    <StyledColorIcon
      textColorValue={
        textColor ? getThemeColorForTextColor(textColor) : 'inherit'
      }
      backgroundColorValue={
        backgroundColor
          ? getThemeColorForBackgroundColor(backgroundColor)
          : 'transparent'
      }
    >
      A
    </StyledColorIcon>
  );
};
