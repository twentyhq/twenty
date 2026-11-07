import { styled } from '@linaria/react';
import { isString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const DISABLED_PRIMARY_ACTION_OPACITY = 0.5;

const StyledPrimaryAction = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::after {
    content: '';
    inset: 0;
    position: absolute;
  }

  &&:focus-visible {
    outline: none;
  }

  &:focus-visible::after {
    border-radius: calc(
      ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
    );
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${DISABLED_PRIMARY_ACTION_OPACITY};
  }
`;

type DraggableListRowPrimaryActionProps = {
  children: ReactNode;
  onAction: () => void;
  isDisabled: boolean;
};

export const DraggableListRowPrimaryAction = ({
  children,
  onAction,
  isDisabled,
}: DraggableListRowPrimaryActionProps) => {
  const primaryAction = (
    <StyledPrimaryAction type="button" onClick={onAction} disabled={isDisabled}>
      {children}
    </StyledPrimaryAction>
  );

  if (!isString(children)) {
    return primaryAction;
  }

  return <OverflowingTextWithTooltip text={children} render={primaryAction} />;
};
