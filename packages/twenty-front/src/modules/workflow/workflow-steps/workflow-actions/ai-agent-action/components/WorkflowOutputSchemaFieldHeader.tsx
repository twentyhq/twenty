import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronDown, IconVariable, IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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
    box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.medium};
  }
`;

const StyledToggle = styled.button`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[2]};
  text-align: left;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:active {
    background: ${themeCssVariables.background.transparent.medium};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;

  & > svg {
    flex-shrink: 0;
  }
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledChevron = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
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
          <StyledName>
            {isNonEmptyString(name) ? name : t`Untitled field`}
          </StyledName>
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
