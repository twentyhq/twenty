import { GettingStartedRollingText } from '@/getting-started/components/GettingStartedRollingText';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { GETTING_STARTED_CUSTOM_STEP_DONE_DESCRIPTIONS } from '@/getting-started/constants/GettingStartedCustomStepDoneDescriptions';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleCheck, useIcons } from 'twenty-ui/icon';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { parseThemeColor } from 'twenty-ui/utilities';

import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

const StyledCard = styled.section<{ isCompleted: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ isCompleted }) =>
      isCompleted
        ? themeCssVariables.color.green5
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lg};
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease-out;
  width: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledHeading = styled.div<{ isCompleted: boolean }>`
  align-items: flex-start;
  background: ${({ isCompleted }) =>
    isCompleted
      ? themeCssVariables.color.green2
      : themeCssVariables.background.secondary};
  border-bottom: 1px solid
    ${({ isCompleted }) =>
      isCompleted
        ? themeCssVariables.color.green3
        : themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[3]};
  transition:
    background calc(${themeCssVariables.animation.duration.normal} * 1s)
      ease-out,
    border-color calc(${themeCssVariables.animation.duration.normal} * 1s)
      ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Tabler draws the circle first and the check last, so only the check is redrawn.
const StyledDoneIcon = styled.span<{ isAnimating: boolean }>`
  color: ${themeCssVariables.tag.text.green};
  display: flex;

  & svg path:last-of-type {
    animation: ${({ isAnimating }) =>
      isAnimating
        ? `getting-started-step-card-draw-check calc(${themeCssVariables.animation.duration.normal} * 1s) ease forwards`
        : 'none'};
    stroke-dasharray: 9;
    stroke-dashoffset: ${({ isAnimating }) => (isAnimating ? 9 : 0)};
  }

  @keyframes getting-started-step-card-draw-check {
    to {
      stroke-dashoffset: 0;
    }
  }
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
  line-height: ${themeCssVariables.text.lineHeight.lg};
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
  const DoneDescription = isCompleted
    ? GETTING_STARTED_CUSTOM_STEP_DONE_DESCRIPTIONS[stepDefinition.actionKey]
    : undefined;

  return (
    <StyledCard isCompleted={isCompleted} aria-label={stepDefinition.title}>
      <StyledHeading isCompleted={isCompleted}>
        {isCompleted ? (
          <StyledDoneIcon isAnimating={isJustCompleted}>
            <IconCircleCheck size={theme.icon.size.xl} />
          </StyledDoneIcon>
        ) : (
          <StepIcon
            size={theme.icon.size.xl}
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
          <StyledDescription>
            {isDefined(DoneDescription) ? (
              <DoneDescription description={stepDefinition.description} />
            ) : (
              stepDefinition.description
            )}
          </StyledDescription>
        </StyledTitle>
      </StyledHeading>
      <StyledBody>
        <GettingStartedStepAction stepDefinition={stepDefinition} />
      </StyledBody>
    </StyledCard>
  );
};
