import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';

const StyledColorIcon = styled.div<{
  textColorValue: string;
  backgroundColorValue: string;
}>`
  background-color: ${({ backgroundColorValue }) => backgroundColorValue};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ textColorValue }) => textColorValue};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 16px;
  line-height: 16px;
  pointer-events: none;
  text-align: center;
  width: 16px;
`;

type BlockNoteColorIconProps = {
  textColor?: BlockNoteColor;
  backgroundColor?: BlockNoteColor;
};

export const BlockNoteColorIcon = ({
  textColor,
  backgroundColor,
}: BlockNoteColorIconProps) => {
  const theme = useTheme();

  const getThemeColorForTextColor = (color: BlockNoteColor): string => {
    if (color === 'default') {
      return 'inherit';
    }
    return theme.color[color] ?? 'inherit';
  };

  const getThemeColorForBackgroundColor = (color: BlockNoteColor): string => {
    if (color === 'default') {
      return 'transparent';
    }
    // Use lighter variant (level 3) for backgrounds
    const backgroundColorKey = `${color}3` as keyof typeof theme.color;
    const themeBackgroundColor = theme.color[backgroundColorKey];
    return typeof themeBackgroundColor === 'string'
      ? themeBackgroundColor
      : 'transparent';
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
