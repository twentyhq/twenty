import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldInputDetailsToggleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledFieldInputDetailsToggleRowInput = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  position: relative;
`;

type FieldInputDetailsToggleRowProps = {
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  toggleLabel: string;
  isToggleVisible?: boolean;
  disabled?: boolean;
};

export const FieldInputDetailsToggleRow = ({
  children,
  isExpanded,
  onToggle,
  toggleLabel,
  isToggleVisible = true,
  disabled,
}: FieldInputDetailsToggleRowProps) => (
  <StyledFieldInputDetailsToggleRow>
    <StyledFieldInputDetailsToggleRowInput>
      {children}
    </StyledFieldInputDetailsToggleRowInput>
    {isToggleVisible && (
      <LightIconButton
        aria-label={toggleLabel}
        aria-expanded={isExpanded}
        disabled={disabled}
        onClick={onToggle}
      >
        {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
      </LightIconButton>
    )}
  </StyledFieldInputDetailsToggleRow>
);
