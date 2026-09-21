import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronDown, IconVariable, IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

type WorkflowOutputSchemaFieldHeaderProps = {
  name: string;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove?: () => void;
};

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};

  &[data-expanded='true'] {
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

const StyledToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: grid;
  flex: 1;
  font: inherit;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 1fr ${themeCssVariables.spacing[6]};
  height: ${themeCssVariables.spacing[8]};
  min-width: 0;
  padding: 0 0 0 ${themeCssVariables.spacing[2]};
  text-align: left;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledChevron = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${themeCssVariables.spacing[6]};

  &[data-expanded='true'] {
    transform: rotate(-180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const WorkflowOutputSchemaFieldHeader = ({
  name,
  isExpanded,
  onToggle,
  onRemove,
}: WorkflowOutputSchemaFieldHeaderProps) => {
  const theme = useTheme();

  return (
    <StyledHeader data-expanded={isExpanded}>
      <StyledToggle type="button" aria-expanded={isExpanded} onClick={onToggle}>
        <StyledTitle>
          <IconVariable size={theme.icon.size.sm} aria-hidden />
          {name || t`Untitled field`}
        </StyledTitle>
        <StyledChevron data-expanded={isExpanded} aria-hidden>
          <IconChevronDown size={theme.icon.size.sm} />
        </StyledChevron>
      </StyledToggle>
      {isDefined(onRemove) && (
        <LightIconButton
          data-testid="remove-output-field-button"
          size="sm"
          onClick={onRemove}
          aria-label={t`Remove output field`}
        >
          <IconX />
        </LightIconButton>
      )}
    </StyledHeader>
  );
};
