import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconListDetails } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding-right: ${themeCssVariables.spacing[1]};
`;

type FieldInputDetailsToggleRowProps = {
  children: ReactNode;
  isExpanded: boolean;
  toggleLabel: string;
  onToggle: () => void;
  hasToggle?: boolean;
};

export const FieldInputDetailsToggleRow = ({
  children,
  isExpanded,
  toggleLabel,
  onToggle,
  hasToggle = true,
}: FieldInputDetailsToggleRowProps) => (
  <StyledRow>
    {children}
    {hasToggle && (
      <LightIconButton
        aria-label={toggleLabel}
        aria-expanded={isExpanded}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
      >
        <IconListDetails />
      </LightIconButton>
    )}
  </StyledRow>
);
