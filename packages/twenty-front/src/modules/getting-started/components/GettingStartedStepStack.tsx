import { GettingStartedStepCard } from '@/getting-started/components/GettingStartedStepCard';
import { EASE_OUT } from '@/ui/theme/constants/EaseOut';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useIcons } from 'twenty-ui/icon';
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

const StyledSteps = styled.nav`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  position: absolute;
  right: calc(100% + ${themeCssVariables.spacing[10]});
  top: 50%;
  transform: translateY(-50%);
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
    background: ${themeCssVariables.font.color.tertiary};
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
  color: ${({ depth }) =>
    depth === 1
      ? themeCssVariables.font.color.primary
      : depth === 2
        ? themeCssVariables.font.color.secondary
        : themeCssVariables.font.color.tertiary};
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
  justCompletedStep: GettingStartedStepActionKey | null;
  isSaving: boolean;
  onSelectStep: (stepActionKey: GettingStartedStepActionKey) => void;
};

export const GettingStartedStepStack = ({
  steps,
  selectedStepActionKey,
  completedStepActionKeys,
  justCompletedStep,
  isSaving,
  onSelectStep,
}: GettingStartedStepStackProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const shouldReduceMotion = useReducedMotion();
  const stepTransition = {
    duration: theme.animation.duration.normal,
    ease: EASE_OUT,
  };
  const stackOffset = shouldReduceMotion ? 0 : 8;
  const cardOffset = shouldReduceMotion ? 0 : 16;

  const selectedStepIndex = steps.findIndex(
    ({ actionKey }) => actionKey === selectedStepActionKey,
  );
  const selectedStepDefinition = steps[selectedStepIndex];
  const stackedSteps = [3, 2, 1]
    .filter((depth) => depth < steps.length)
    .map((depth) => ({
      depth,
      stepDefinition: steps[(selectedStepIndex + depth) % steps.length],
    }));

  return (
    <div>
      <AnimatePresence initial={false} mode="popLayout">
        {stackedSteps.map(({ depth, stepDefinition }) => {
          const { actionKey, icon, iconColor, title } = stepDefinition;
          const StepIcon = getIcon(icon);

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
              disabled={isSaving}
              onClick={() => onSelectStep(actionKey)}
            >
              <StepIcon
                size={theme.icon.size.md}
                color={themeCssVariables.tag.text[parseThemeColor(iconColor)]}
              />
              <StyledStackedStepTitle>{title}</StyledStackedStepTitle>
            </StyledStackedStep>
          );
        })}
      </AnimatePresence>
      <StyledActiveStep>
        <StyledSteps aria-label={t`Getting started steps`}>
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
              onClick={() => onSelectStep(actionKey)}
            />
          ))}
        </StyledSteps>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedStepActionKey}
            initial={{ opacity: 0, y: -cardOffset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: cardOffset,
              scale: 0.98,
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
              isJustCompleted={justCompletedStep === selectedStepActionKey}
            />
          </motion.div>
        </AnimatePresence>
      </StyledActiveStep>
    </div>
  );
};
