import { GettingStartedRollingText } from '@/getting-started/components/GettingStartedRollingText';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { AnimatedCheckmark } from '@/ui/navigation/step-bar/components/internal/AnimatedCheckmark/AnimatedCheckmark';
import { styled } from '@linaria/react';
import { IconCheck, useIcons } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { parseThemeColor } from 'twenty-ui/utilities';

import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

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
  stepDefinition: GettingStartedStepDefinition;
  isCompleted: boolean;
  isJustCompleted: boolean;
};

export const GettingStartedStepCard = ({
  stepDefinition,
  isCompleted,
  isJustCompleted,
}: GettingStartedStepCardProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const StepIcon = getIcon(stepDefinition.icon);

  return (
    <Card.Root
      fullWidth
      backgroundColor={themeCssVariables.background.primary}
      render={<section />}
      aria-label={stepDefinition.title}
    >
      <StyledHeading isCompleted={isCompleted}>
        {isCompleted && isJustCompleted ? (
          <StyledAnimatedCheckmark>
            <AnimatedCheckmark isAnimating color={theme.font.color.primary} />
          </StyledAnimatedCheckmark>
        ) : isCompleted ? (
          <IconCheck size={theme.icon.size.lg} />
        ) : (
          <StepIcon
            size={theme.icon.size.lg}
            color={
              themeCssVariables.tag.text[
                parseThemeColor(stepDefinition.iconColor)
              ]
            }
          />
        )}
        <StyledTitle>
          <Heading size="lg">
            <GettingStartedRollingText
              text={
                isCompleted ? stepDefinition.doneTitle : stepDefinition.title
              }
            />
          </Heading>
          <StyledDescription>{stepDefinition.description}</StyledDescription>
        </StyledTitle>
      </StyledHeading>
      <StyledBody>
        <GettingStartedStepAction stepDefinition={stepDefinition} />
      </StyledBody>
    </Card.Root>
  );
};
