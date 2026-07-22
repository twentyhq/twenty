import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WelcomePersonChip } from '@/onboarding/components/WelcomeOverlay/WelcomePersonChip';
import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { WELCOME_TITLE_WORDS } from '@/onboarding/constants/WelcomeTitleWords';
import { isWelcomeAnimationLeavingState } from '@/onboarding/states/isWelcomeAnimationLeavingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledPreamble = styled.div<{
  isHiddenBehindOverlay: boolean;
  shouldRevealAfterFlight: boolean;
}>`
  animation: ${({ shouldRevealAfterFlight }) =>
    shouldRevealAfterFlight
      ? 'workspaceSetupPreambleIn 0.14s ease-out 0.42s both'
      : 'none'};
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4em;
  opacity: ${({ isHiddenBehindOverlay }) => (isHiddenBehindOverlay ? 0 : 1)};
  overflow-wrap: break-word;
  width: 100%;

  @keyframes workspaceSetupPreambleIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-delay: 0s;
  }
`;

const StyledSingleLineHandoffRun = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

export const WorkspaceSetupChatPreamble = () => {
  const { t } = useLingui();
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );
  const isWelcomeAnimationLeaving = useAtomStateValue(
    isWelcomeAnimationLeavingState,
  );

  return (
    <StyledPreamble
      isHiddenBehindOverlay={
        isWelcomeAnimationVisible && !isWelcomeAnimationLeaving
      }
      shouldRevealAfterFlight={isWelcomeAnimationLeaving}
    >
      <StyledSingleLineHandoffRun id={WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID}>
        {WELCOME_TITLE_WORDS.join(' ')}
        <WelcomePersonChip avatarSize="xs" sizeVariant="compact" />
      </StyledSingleLineHandoffRun>{' '}
      {t`It natively comes with 7 standard objects.`}
    </StyledPreamble>
  );
};
