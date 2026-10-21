import { GettingStartedStepCard } from '@/getting-started/components/GettingStartedStepCard';
import { GettingStartedStepRewardChip } from '@/getting-started/components/GettingStartedStepRewardChip';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type GettingStartedStep } from '~/generated-metadata/graphql';

const StyledStack = styled.div`
  padding-left: ${themeCssVariables.spacing[8]};
  position: relative;
`;

const StyledSteps = styled.nav`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  left: 0;
  position: absolute;
  top: ${themeCssVariables.spacing[6]};
  width: ${themeCssVariables.spacing[4]};
`;

const StyledTick = styled.button`
  background: ${themeCssVariables.border.color.medium};
  border: 0;
  border-radius: ${themeCssVariables.border.radius.xs};
  cursor: pointer;
  height: ${themeCssVariables.spacing[0.5]};
  padding: 0;
  width: ${themeCssVariables.spacing[2]};

  &[data-completed] {
    background: ${themeCssVariables.font.color.tertiary};
    width: ${themeCssVariables.spacing[3]};
  }

  &[aria-current='step'] {
    background: ${themeCssVariables.font.color.primary};
    width: ${themeCssVariables.spacing[4]};
  }

  &::after {
    content: '';
    display: block;
    height: ${themeCssVariables.spacing[2]};
    margin-top: calc(-1 * ${themeCssVariables.spacing[1]});
    width: 100%;
  }
`;

const StyledStackedStep = styled.button<{ depth: number }>`
  align-items: center;
  background: ${({ depth }) =>
    depth > 1
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0 0;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[9]};
  margin: 0 auto calc(-1 * ${themeCssVariables.spacing[2]});
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
  width: ${({ depth }) =>
    `calc(100% - ${depth} * ${themeCssVariables.spacing[6]})`};

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledStackedStepTitle = styled.span`
  flex: 1;
  text-align: left;
`;

type GettingStartedStepStackProps = {
  selectedStep: GettingStartedStep;
  completedSteps: GettingStartedStep[];
  isSaving: boolean;
  onSelectStep: (step: GettingStartedStep) => void;
};

export const GettingStartedStepStack = ({
  selectedStep,
  completedSteps,
  isSaving,
  onSelectStep,
}: GettingStartedStepStackProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const selectedStepIndex = GETTING_STARTED_STEPS.indexOf(selectedStep);
  const stackedSteps = [2, 1].map((depth) => ({
    depth,
    step: GETTING_STARTED_STEPS[
      (selectedStepIndex + depth) % GETTING_STARTED_STEPS.length
    ],
  }));

  return (
    <StyledStack>
      <StyledSteps aria-label={t`Getting started steps`}>
        {GETTING_STARTED_STEPS.map((step) => (
          <StyledTick
            key={step}
            type="button"
            aria-label={t(GETTING_STARTED_STEP_CONTENT[step].title)}
            aria-current={step === selectedStep ? 'step' : undefined}
            data-completed={completedSteps.includes(step) || undefined}
            disabled={isSaving}
            onClick={() => onSelectStep(step)}
          />
        ))}
      </StyledSteps>
      {stackedSteps.map(({ depth, step }) => {
        const StepIcon = GETTING_STARTED_STEP_CONTENT[step].Icon;

        return (
          <StyledStackedStep
            key={step}
            type="button"
            depth={depth}
            disabled={isSaving}
            onClick={() => onSelectStep(step)}
          >
            <StepIcon size={theme.icon.size.sm} />
            <StyledStackedStepTitle>
              {t(GETTING_STARTED_STEP_CONTENT[step].title)}
            </StyledStackedStepTitle>
            <GettingStartedStepRewardChip
              step={step}
              isCompleted={completedSteps.includes(step)}
            />
          </StyledStackedStep>
        );
      })}
      <GettingStartedStepCard
        step={selectedStep}
        isCompleted={completedSteps.includes(selectedStep)}
      />
    </StyledStack>
  );
};
