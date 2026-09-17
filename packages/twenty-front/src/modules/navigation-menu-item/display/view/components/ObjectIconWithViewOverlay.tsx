import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  justify-content: center;
  position: relative;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledViewOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: -5px;
  display: flex;
  height: 14px;
  justify-content: center;
  position: absolute;
  right: -6px;
  width: 12px;
`;

export type ObjectIconWithViewOverlayProps = {
  ObjectIcon: IconComponent;
  ViewIcon: IconComponent;
  objectColor?: string | null;
};

export const ObjectIconWithViewOverlay = ({
  ObjectIcon,
  ViewIcon,
  objectColor,
}: ObjectIconWithViewOverlayProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCompositeContainer>
      <ColoredIcon Icon={ObjectIcon} color={objectColor} />
      <StyledViewOverlay $backgroundColor={themeCssVariables.grayScale.gray4}>
        <ViewIcon
          size="12px"
          stroke={theme.icon.stroke.md}
          color={themeCssVariables.grayScale.gray10}
        />
      </StyledViewOverlay>
    </StyledCompositeContainer>
  );
};
