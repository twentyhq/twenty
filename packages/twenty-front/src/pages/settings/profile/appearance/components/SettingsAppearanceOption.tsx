import { styled } from '@linaria/react';
import { useId } from 'react';

import { IconCheck } from 'twenty-ui/icon';
import { Radio } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables, useTheme } from 'twenty-ui/theme';
import { SettingsAppearancePreview } from '~/pages/settings/profile/appearance/components/SettingsAppearancePreview';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

const StyledChoice = styled.label`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex: 0 0 160px;
  }
`;

const StyledTile = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: block;
  position: relative;
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.32;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    &:focus-visible {
      outline-offset: -2px;
    }
  }
`;

const StyledCheckmark = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: ${themeCssVariables.spacing[2]};
  color: ${themeCssVariables.grayScale.gray1};
  corner-shape: round;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  inset-inline-end: ${themeCssVariables.spacing[2]};
  justify-content: center;
  opacity: 0;
  position: absolute;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0s linear 0.3s;
  visibility: hidden;
  width: ${themeCssVariables.spacing[5]};

  &[data-checked] {
    opacity: 1;
    transition:
      opacity 0.3s ease-in-out,
      visibility 0s;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &[data-checked] {
      transition: none;
    }
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAppearanceOptionProps = {
  colorScheme: ColorScheme;
  label: string;
};

export const SettingsAppearanceOption = ({
  colorScheme,
  label,
}: SettingsAppearanceOptionProps) => {
  const theme = useTheme();
  const labelId = useId();

  return (
    <StyledChoice>
      <Radio.Root
        value={colorScheme}
        aria-labelledby={labelId}
        render={<StyledTile />}
      >
        <SettingsAppearancePreview colorScheme={colorScheme} />
        <Radio.Indicator keepMounted aria-hidden render={<StyledCheckmark />}>
          <IconCheck size={theme.icon.size.sm} />
        </Radio.Indicator>
      </Radio.Root>
      <StyledLabel id={labelId}>{label}</StyledLabel>
    </StyledChoice>
  );
};
