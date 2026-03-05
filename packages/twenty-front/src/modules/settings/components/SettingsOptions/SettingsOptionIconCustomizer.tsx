import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

type SettingsOptionIconCustomizerProps = {
  Icon: IconComponent;
  zoom?: number;
  rotate?: number;
};

const StyledIconCustomizer = styled.div<{ zoom: number; rotate: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: scale(${({ zoom }) => zoom}) rotate(${({ rotate }) => rotate}deg);
`;

export const SettingsOptionIconCustomizer = ({
  Icon,
  zoom = 1,
  rotate = -4,
}: SettingsOptionIconCustomizerProps) => {
  return (
    <StyledIconCustomizer zoom={zoom} rotate={rotate}>
      <Icon
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg)}
        color={resolveThemeVariable(
          themeCssVariables.IllustrationIcon.color.gray,
        )}
        stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md)}
      />
    </StyledIconCustomizer>
  );
};
