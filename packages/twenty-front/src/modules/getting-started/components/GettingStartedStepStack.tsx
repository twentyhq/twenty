import { GettingStartedStepCard } from '@/getting-started/components/GettingStartedStepCard';
import { GETTING_STARTED_STACKED_STEP_COLOR_BY_DEPTH } from '@/getting-started/constants/GettingStartedStackedStepColorByDepth';
import { GETTING_STARTED_STEP_TICKS_MIN_CONTAINER_WIDTH } from '@/getting-started/constants/GettingStartedStepTicksMinContainerWidth';
import { useSelectGettingStartedStep } from '@/getting-started/hooks/useSelectGettingStartedStep';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { getGettingStartedAdjacentSteps } from '@/getting-started/utils/getGettingStartedAdjacentSteps';
import { getGettingStartedStackedSteps } from '@/getting-started/utils/getGettingStartedStackedSteps';
import { EASE_OUT } from '@/ui/theme/constants/EaseOut';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { parseThemeColor } from 'twenty-ui/utilities';

import {
  type GettingStartedStepActionKey,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

const StyledActiveStep = styled.div`
  border-radius: ${themeCssVariables.border.radius.lg};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  position: relative;
`;

const StyledStepsTrack = styled.div`
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  right: calc(100% + ${themeCssVariables.spacing[10]});
  top: 0;

  @container getting-started-scroll (max-width: ${GETTING_STARTED_STEP_TICKS_MIN_CONTAINER_WIDTH}px) {
    display: none;
  }
`;

const StyledSteps = styled.nav`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: auto;
  position: sticky;
  top: ${themeCssVariables.spacing[10]};
`;

const StyledTicks = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTick = styled.button`
  background: ${themeCssVariables.border.color.strong};
  border: 0;
  border-radius: ${themeCssVariables.border.radius.xs};
  cursor: pointer;
  height: ${themeCssVariables.spacing[0.5]};
  padding: 0;
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out,
    width calc(${themeCssVariables.animation.duration.fast} * 1s) ease-out;
  width: ${themeCssVariables.spacing[3]};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &[data-completed] {
    background: ${themeCssVariables.color.green};
  }

  &[aria-current='step'] {
    background: ${themeCssVariables.font.color.primary};
    width: ${themeCssVariables.spacing[5]};
  }

  &::after {
    content: '';
    display: block;
    height: ${themeCssVariables.spacing[2]};
    margin-top: calc(-1 * ${themeCssVariables.spacing[1]});
    width: 100%;
  }
`;

const StyledStackedStepBase = styled.button<{ depth: number }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.lg}
    ${themeCssVariables.border.radius.lg} 0 0;
  color: ${({ depth }) => GETTING_STARTED_STACKED_STEP_COLOR_BY_DEPTH[depth]};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[11]};
  margin: 0 auto calc(-1 * ${themeCssVariables.spacing['1.5']});
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing['1.5']};
  transition:
    color calc(${themeCssVariables.animation.duration.normal} * 1s) ease-out,
    width calc(${themeCssVariables.animation.duration.normal} * 1s) ease-out;
  width: ${({ depth }) =>
    `calc(100% - ${depth} * ${themeCssVariables.spacing[8]})`};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &[data-completed] {
    background: ${themeCssVariables.color.green2};
    border-color: ${themeCssVariables.color.green4};
  }

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledStackedStep = motion.create(StyledStackedStepBase);

const StyledStackedStepTitle = styled.span`
  flex: 1;
  text-align: left;
`;

type GettingStartedStepStackProps = {
  steps: GettingStartedStepDefinition[];
  selectedStepActionKey: GettingStartedStepActionKey;
  completedStepActionKeys: GettingStartedStepActionKey[];
};

export const GettingStartedStepStack = ({
  steps,
  selectedStepActionKey,
  completedStepActionKeys,
}: GettingStartedStepStackProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const shouldReduceMotion = useReducedMotion();
  const { selectGettingStartedStep, isSaving } = useSelectGettingStartedStep();
  const gettingStartedJustCompletedStep = useAtomStateValue(
    gettingStartedJustCompletedStepState,
  );
  const stepTransition = {
    duration: theme.animation.duration.normal,
    ease: EASE_OUT,
  };
  const stackOffset = shouldReduceMotion ? 0 : theme.spacingMultiplicator * 2;
  const cardOffset = shouldReduceMotion ? 0 : theme.spacingMultiplicator * 4;

  const selectedStepIndex = steps.findIndex(
    ({ actionKey }) => actionKey === selectedStepActionKey,
  );
  const selectedStepDefinition = steps[selectedStepIndex];
  const { previousStepActionKey, nextStepActionKey } =
    getGettingStartedAdjacentSteps({
      steps,
      completedStepActionKeys,
      selectedStepActionKey,
    });
  const stackedSteps = getGettingStartedStackedSteps({
    steps,
    completedStepActionKeys,
    selectedStepActionKey,
  })
    .map((stepDefinition, index) => ({ depth: index + 1, stepDefinition }))
    .reverse();

  return (
    <div>
      <AnimatePresence initial={false} mode="popLayout">
        {stackedSteps.map(({ depth, stepDefinition }) => {
          const { actionKey, icon, iconColor, title, doneTitle } =
            stepDefinition;
          const StepIcon = getIcon(icon);
          const isCompleted = completedStepActionKeys.includes(actionKey);

          return (
            <StyledStackedStep
              key={actionKey}
              layout="position"
              initial={{ opacity: 0, y: -stackOffset }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: stackOffset }}
              transition={stepTransition}
              type="button"
              depth={depth}
              data-completed={isCompleted || undefined}
              disabled={isSaving}
              onClick={() => selectGettingStartedStep(actionKey)}
            >
              {isCompleted ? (
                <IconCircleCheck
                  size={theme.icon.size.md}
                  color={themeCssVariables.tag.text.green}
                />
              ) : (
                <StepIcon
                  size={theme.icon.size.md}
                  color={themeCssVariables.tag.text[parseThemeColor(iconColor)]}
                />
              )}
              <StyledStackedStepTitle>
                {isCompleted ? doneTitle : title}
              </StyledStackedStepTitle>
            </StyledStackedStep>
          );
        })}
      </AnimatePresence>
      <StyledActiveStep>
        <StyledStepsTrack>
          <StyledSteps aria-label={t`Getting started steps`}>
            <LightIconButton
              size="xs"
              emphasis="subtle"
              aria-label={t`Previous step`}
              disabled={isSaving || !isDefined(previousStepActionKey)}
              onClick={() =>
                isDefined(previousStepActionKey) &&
                selectGettingStartedStep(previousStepActionKey)
              }
            >
              <IconChevronUp />
            </LightIconButton>
            <StyledTicks>
              {steps.map(({ actionKey, title }) => (
                <StyledTick
                  key={actionKey}
                  type="button"
                  aria-label={title}
                  aria-current={
                    actionKey === selectedStepActionKey ? 'step' : undefined
                  }
                  data-completed={
                    completedStepActionKeys.includes(actionKey) || undefined
                  }
                  disabled={isSaving}
                  onClick={() => selectGettingStartedStep(actionKey)}
                />
              ))}
            </StyledTicks>
            <LightIconButton
              size="xs"
              emphasis="subtle"
              aria-label={t`Next step`}
              disabled={isSaving || !isDefined(nextStepActionKey)}
              onClick={() =>
                isDefined(nextStepActionKey) &&
                selectGettingStartedStep(nextStepActionKey)
              }
            >
              <IconChevronDown />
            </LightIconButton>
          </StyledSteps>
        </StyledStepsTrack>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedStepActionKey}
            initial={{ opacity: 0, y: -cardOffset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: cardOffset,
              scale: shouldReduceMotion ? 1 : 0.98,
              transition: {
                duration: theme.animation.duration.fast,
                ease: EASE_OUT,
              },
            }}
            transition={stepTransition}
          >
            <GettingStartedStepCard
              stepDefinition={selectedStepDefinition}
              isCompleted={completedStepActionKeys.includes(
                selectedStepActionKey,
              )}
              isJustCompleted={
                gettingStartedJustCompletedStep === selectedStepActionKey
              }
            />
          </motion.div>
        </AnimatePresence>
      </StyledActiveStep>
    </div>
  );
};
