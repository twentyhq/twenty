import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
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

  useEffect(() => {
    if (!isDefined(holdTimeoutId)) {
      return;
    }

    if (disabled) {
      clearTimeout(holdTimeoutId);
      setHoldTimeoutId(null);

      return;
    }

    return () => clearTimeout(holdTimeoutId);
  }, [holdTimeoutId, disabled]);

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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    handleHoldStart();
  };

  const isConfirmationKey = (event: KeyboardEvent<HTMLDivElement>) =>
    event.key === 'Enter' || event.key === ' ';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isConfirmationKey(event)) {
      return;
    }

    event.preventDefault();

    if (event.repeat) {
      return;
    }

    handleHoldStart();
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isConfirmationKey(event)) {
      return;
    }

    event.preventDefault();
    handleHoldEnd();
  };

  return (
    <StyledContainer
      onPointerDown={handlePointerDown}
      onPointerUp={handleHoldEnd}
      onPointerLeave={handleHoldEnd}
      onPointerCancel={handleHoldEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleHoldEnd}
    >
      {children}
      <StyledOverlay data-holding={isHolding} holdDurationMs={holdDurationMs} />
    </StyledContainer>
  );
};
