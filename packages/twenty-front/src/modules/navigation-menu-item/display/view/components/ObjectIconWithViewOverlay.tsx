import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent, getIconTileColorShades } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  position: relative;
  width: 16px;
`;

const StyledObjectIconWrapper = styled.div<{
  $backgroundColor: string;
  $borderColor?: string;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: ${({ $borderColor }) =>
    $borderColor ? `1px solid ${$borderColor}` : 'none'};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const StyledViewOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 4px;
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
  const objectStyle = getIconTileColorShades(objectColor);

  return (
    <StyledCompositeContainer>
      <StyledObjectIconWrapper
        $backgroundColor={objectStyle.backgroundColor}
        $borderColor={objectStyle.borderColor}
      >
        <ObjectIcon
          size="14px"
          stroke={theme.icon.stroke.md}
          color={objectStyle.iconColor}
        />
      </StyledObjectIconWrapper>
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
