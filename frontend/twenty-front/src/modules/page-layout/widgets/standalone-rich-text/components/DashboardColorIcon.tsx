import { styled } from '@linaria/react';

import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';
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
  const { theme } = useContext(ThemeContext);

  const getThemeColorForTextColor = (color: BlockNoteColor): string => {
    if (color === 'default') {
      return 'inherit';
    }
    return (
      (theme.color as unknown as Record<string, string>)[color] ?? 'inherit'
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
      gray: theme.color.gray3,
      brown: theme.color.brown3,
      red: theme.color.red3,
      orange: theme.color.orange3,
      yellow: theme.color.yellow3,
      green: theme.color.green3,
      blue: theme.color.blue3,
      purple: theme.color.purple3,
      pink: theme.color.pink3,
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
