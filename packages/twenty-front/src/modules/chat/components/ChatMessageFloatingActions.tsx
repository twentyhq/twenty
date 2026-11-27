import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFloatingActions = styled.div<{ isRightAligned: boolean }>`
  left: ${({ isRightAligned }) => (isRightAligned ? '0' : 'auto')};
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: ${({ isRightAligned }) => (isRightAligned ? 'auto' : '0')};
  top: calc(-1 * ${themeCssVariables.spacing[4]});
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;
  z-index: 1;
`;

type ChatMessageFloatingActionsProps = {
  isRightAligned: boolean;
  children: ReactNode;
};

export const ChatMessageFloatingActions = ({
  isRightAligned,
  children,
}: ChatMessageFloatingActionsProps) => {
  const { t } = useLingui();

  return (
    <StyledFloatingActions
      className="message-actions"
      isRightAligned={isRightAligned}
    >
      <ButtonGroup aria-label={t`Message actions`} framed attached={false}>
        {children}
      </ButtonGroup>
    </StyledFloatingActions>
  );
};
