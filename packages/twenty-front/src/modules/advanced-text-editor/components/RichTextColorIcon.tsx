import { styled } from '@linaria/react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, type RichTextColor } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledColorIcon = styled.div<{
  textColorValue: string;
  backgroundColorValue: string;
}>`
  background-color: ${({ backgroundColorValue }) => backgroundColorValue};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ textColorValue }) => textColorValue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  line-height: calc(${themeCssVariables.icon.size.md} * 1px);
  pointer-events: none;
  text-align: center;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

type RichTextColorIconProps = {
  textColor?: RichTextColor | null;
  backgroundColor?: RichTextColor | null;
};

export const RichTextColorIcon = ({
  textColor,
  backgroundColor,
}: RichTextColorIconProps) => (
  <StyledColorIcon
    textColorValue={
      isDefined(textColor) ? themeCssVariables.color[textColor] : 'inherit'
    }
    backgroundColorValue={
      isDefined(backgroundColor)
        ? themeCssVariables.color[`${backgroundColor}3`]
        : 'transparent'
    }
  >
    {doNotTranslate('A')}
  </StyledColorIcon>
);
