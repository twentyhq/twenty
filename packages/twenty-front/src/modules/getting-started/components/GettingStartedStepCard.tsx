import { GettingStartedRollingText } from '@/getting-started/components/GettingStartedRollingText';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { GettingStartedStepDoneButton } from '@/getting-started/components/GettingStartedStepDoneButton';
import { GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS } from '@/getting-started/constants/GettingStartedCustomStepDoneActions';
import { GETTING_STARTED_CUSTOM_STEP_DONE_DESCRIPTIONS } from '@/getting-started/constants/GettingStartedCustomStepDoneDescriptions';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleCheck } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { parseThemeColor } from 'twenty-ui/utilities';

import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

const StyledCard = styled.section<{ isCompleted: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ isCompleted }) =>
      isCompleted
        ? themeCssVariables.color.green7
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lg};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
      ? themeCssVariables.tag.background.green
      : themeCssVariables.background.secondary};
  border-bottom: 1px solid
    ${({ isCompleted }) =>
      isCompleted
        ? themeCssVariables.color.green6
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

  &:last-child {
    border-bottom: 0;
    padding-bottom: ${themeCssVariables.spacing[4]};
  }
`;

const StyledDoneIcon = styled.span`
  color: ${themeCssVariables.tag.text.green};
  display: flex;

  & svg path:last-of-type {
    stroke-dasharray: 9;
    stroke-dashoffset: 0;
  }

  &[data-animating] svg path:last-of-type {
    animation: getting-started-step-card-draw-check
      calc(${themeCssVariables.animation.duration.normal} * 1s) ease forwards;
    stroke-dashoffset: 9;
  }

  @keyframes getting-started-step-card-draw-check {
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-animating] svg path:last-of-type {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

const StyledHeadingContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
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
  overflow-y: auto;
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
  const description = isCompleted
    ? stepDefinition.doneDescription
    : stepDefinition.description;
  const DoneAction = isCompleted
    ? GETTING_STARTED_CUSTOM_STEP_DONE_ACTIONS[stepDefinition.actionKey]
    : undefined;

  return (
    <StyledCard
      isCompleted={isCompleted}
      aria-label={isCompleted ? stepDefinition.doneTitle : stepDefinition.title}
    >
      <StyledHeading isCompleted={isCompleted}>
        {isCompleted ? (
          <StyledDoneIcon data-animating={isJustCompleted || undefined}>
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
        <StyledHeadingContent>
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
                <DoneDescription description={description} />
              ) : (
                description
              )}
            </StyledDescription>
          </StyledTitle>
          {isCompleted && (
            <GettingStartedStepDoneButton stepDefinition={stepDefinition} />
          )}
        </StyledHeadingContent>
      </StyledHeading>
      {!isCompleted && (
        <StyledBody>
          <GettingStartedStepAction stepDefinition={stepDefinition} />
        </StyledBody>
      )}
      {isDefined(DoneAction) && (
        <StyledBody>
          <DoneAction />
        </StyledBody>
      )}
    </StyledCard>
  );
};
