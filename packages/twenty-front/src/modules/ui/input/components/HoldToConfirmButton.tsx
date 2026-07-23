import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { themeCssVariables } from 'twenty-ui/theme-constants';

const DEFAULT_HOLD_DURATION_MS = 1500;

const StyledContainer = styled.div`
  cursor: pointer;
  display: inline-flex;
  position: relative;

  button {
    pointer-events: none;
  }
`;

const StyledOverlay = styled.div<{ holdDurationMs: number }>`
  background: ${themeCssVariables.background.overlayHoldToConfirm};
  border-radius: ${themeCssVariables.border.radius.sm};
  inset: 0 auto 0 0;
  pointer-events: none;
  position: absolute;
  transition: width 150ms ease-out;
  width: 0;

  &[data-holding='true'] {
    transition: width ${({ holdDurationMs }) => holdDurationMs}ms linear;
    width: 100%;
  }
`;

type HoldToConfirmButtonProps = {
  onConfirm: () => void;
  disabled?: boolean;
  holdDurationMs?: number;
  children: ReactNode;
};

export const HoldToConfirmButton = ({
  onConfirm,
  disabled = false,
  holdDurationMs = DEFAULT_HOLD_DURATION_MS,
  children,
}: HoldToConfirmButtonProps) => {
  const [holdTimeoutId, setHoldTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const isHolding = isDefined(holdTimeoutId);

  const handleHoldStart = () => {
    if (disabled || isHolding) {
      return;
    }

    setHoldTimeoutId(
      setTimeout(() => {
        setHoldTimeoutId(null);
        onConfirm();
      }, holdDurationMs),
    );
  };

  const handleHoldEnd = () => {
    if (!isHolding) {
      return;
    }

    clearTimeout(holdTimeoutId);
    setHoldTimeoutId(null);
  };

  return (
    <StyledContainer
      onPointerDown={handleHoldStart}
      onPointerUp={handleHoldEnd}
      onPointerLeave={handleHoldEnd}
      onPointerCancel={handleHoldEnd}
    >
      {children}
      <StyledOverlay data-holding={isHolding} holdDurationMs={holdDurationMs} />
    </StyledContainer>
  );
};
