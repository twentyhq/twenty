import { GettingStartedStepRewardChip } from '@/getting-started/components/GettingStartedStepRewardChip';
import { GettingStartedRollingText } from '@/getting-started/components/GettingStartedRollingText';
import { GETTING_STARTED_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedStepActions';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { AnimatedCheckmark } from '@/ui/navigation/step-bar/components/internal/AnimatedCheckmark/AnimatedCheckmark';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  type GettingStartedStep,
  type GettingStartedStepReward,
} from '~/generated-metadata/graphql';

const StyledHeading = styled.div<{ isCompleted: boolean }>`
  align-items: flex-start;
  background: ${({ isCompleted }) =>
    isCompleted
      ? themeCssVariables.color.green3
      : themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
  transition: background
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledAnimatedCheckmark = styled.span`
  display: flex;
  margin: calc(-1 * ${themeCssVariables.spacing[1]});
`;

const StyledTitle = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[6]};
`;

type GettingStartedStepCardProps = {
  step: GettingStartedStep;
  stepReward: GettingStartedStepReward | undefined;
  isCompleted: boolean;
  isJustCompleted: boolean;
};

export const GettingStartedStepCard = ({
  step,
  stepReward,
  isCompleted,
  isJustCompleted,
}: GettingStartedStepCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const content = GETTING_STARTED_STEP_CONTENT[step];
  const StepAction = GETTING_STARTED_STEP_ACTIONS[step];

  return (
    <Card.Root
      fullWidth
      backgroundColor={themeCssVariables.background.primary}
      render={<section />}
      aria-label={t(content.title)}
    >
      <StyledHeading isCompleted={isCompleted}>
        {isCompleted && isJustCompleted ? (
          <StyledAnimatedCheckmark>
            <AnimatedCheckmark isAnimating color={theme.font.color.primary} />
          </StyledAnimatedCheckmark>
        ) : isCompleted ? (
          <IconCheck size={theme.icon.size.lg} />
        ) : (
          <content.Icon size={theme.icon.size.lg} color={content.iconColor} />
        )}
        <StyledTitle>
          <Heading size="lg">
            <GettingStartedRollingText
              text={t(isCompleted ? content.doneTitle : content.title)}
            />
          </Heading>
          <StyledDescription>{t(content.description)}</StyledDescription>
        </StyledTitle>
        <GettingStartedStepRewardChip stepReward={stepReward} />
      </StyledHeading>
      <StyledBody>
        <StepAction />
      </StyledBody>
    </Card.Root>
  );
};
