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
}>`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4em;
  opacity: ${({ isHiddenBehindOverlay }) => (isHiddenBehindOverlay ? 0 : 1)};
  overflow-wrap: break-word;
  width: 100%;
`;

const StyledSingleLineHandoffRun = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  &.is-revealing-after-flight {
    animation: workspaceSetupHandoffRunIn 0.12s ease-out 0.62s both;
  }

  @keyframes workspaceSetupHandoffRunIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.is-revealing-after-flight {
      animation-delay: 0s;
    }
  }
`;

const StyledContinuation = styled.span`
  &.is-revealing-after-flight {
    animation: workspaceSetupContinuationIn 0.2s ease-out 0.8s both;
  }

  @keyframes workspaceSetupContinuationIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.is-revealing-after-flight {
      animation-delay: 0s;
    }
  }
`;

export const WorkspaceSetupChatPreamble = () => {
  const { t } = useLingui();
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );
  const isWelcomeAnimationLeaving = useAtomStateValue(
    isWelcomeAnimationLeavingState,
  );

  const revealClassName = isWelcomeAnimationLeaving
    ? 'is-revealing-after-flight'
    : undefined;

  return (
    <StyledPreamble
      isHiddenBehindOverlay={
        isWelcomeAnimationVisible && !isWelcomeAnimationLeaving
      }
    >
      <StyledSingleLineHandoffRun
        id={WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID}
        className={revealClassName}
      >
        {WELCOME_TITLE_WORDS.join(' ')}
        <WelcomePersonChip avatarSize="xs" sizeVariant="compact" />
      </StyledSingleLineHandoffRun>{' '}
      <StyledContinuation className={revealClassName}>
        {t`It natively comes with 7 standard objects.`}
      </StyledContinuation>
    </StyledPreamble>
  );
};
