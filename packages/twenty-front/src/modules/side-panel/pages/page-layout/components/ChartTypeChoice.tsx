import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledChoice = styled(Button)`
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: auto;
  min-height: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[1.5]} ${themeCssVariables.spacing[1]};

  &[aria-pressed='true'] {
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.color.blue};
  }

  &[aria-pressed='true']:hover {
    background: ${themeCssVariables.background.transparent.primary};
  }

  &:disabled,
  &:disabled:hover {
    background: ${themeCssVariables.background.secondary};
    border-color: ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.extraLight};
    cursor: default;
  }
`;

type ChartTypeChoiceProps = {
  icon: IconComponent;
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const ChartTypeChoice = ({
  icon: Icon,
  label,
  selected,
  onClick,
  disabled = false,
}: ChartTypeChoiceProps) => {
  const theme = useTheme();
  return (
    <Tooltip
      content={label}
      side="bottom"
      sideOffset={5}
      delay={0}
      positionMethod="fixed"
    >
      <StyledChoice
        variant="outline"
        aria-label={label}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
      >
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      </StyledChoice>
    </Tooltip>
  );
};
