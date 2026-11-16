import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButton = styled(Button)`
  background: transparent;
  border-color: ${themeCssVariables.border.color.medium};
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  padding-inline: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &[aria-pressed='true'] {
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.color.blue};

    &:hover {
      background: ${themeCssVariables.background.transparent.primary};
    }
  }
`;

type WidgetVariantSelectionSectionProps<TVariant extends string> = {
  ariaLabel: string;
  options: {
    variant: TVariant;
    Icon: IconComponent;
    label: string;
    disabledReason?: string;
  }[];
  currentVariant: TVariant;
  onSelect: (variant: TVariant) => void;
};

export const WidgetVariantSelectionSection = <TVariant extends string>({
  ariaLabel,
  options,
  currentVariant,
  onSelect,
}: WidgetVariantSelectionSectionProps<TVariant>) => {
  const theme = useTheme();

  return (
    <StyledContainer role="group" aria-label={ariaLabel}>
      {options.map(({ variant, Icon, label, disabledReason }) => (
        <Tooltip
          key={variant}
          content={disabledReason ?? label}
          side="bottom"
          sideOffset={theme.spacingMultiplicator}
          positionMethod="fixed"
          delay={0}
        >
          <StyledButton
            id={variant}
            fullWidth
            aria-label={label}
            aria-pressed={currentVariant === variant}
            disabled={isDefined(disabledReason)}
            onClick={() => {
              onSelect(variant);
            }}
          >
            <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </StyledButton>
        </Tooltip>
      ))}
    </StyledContainer>
  );
};
