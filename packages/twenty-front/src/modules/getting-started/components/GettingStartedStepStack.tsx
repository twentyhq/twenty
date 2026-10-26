import { GettingStartedStepCard } from '@/getting-started/components/GettingStartedStepCard';
import { GettingStartedStepRewardChip } from '@/getting-started/components/GettingStartedStepRewardChip';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  type GettingStartedStep,
  type GettingStartedStepDefinition,
} from '~/generated-metadata/graphql';

const StyledActiveStep = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
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
  width: ${themeCssVariables.spacing[3]};

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

const StyledStackedStep = styled.button<{ depth: number }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0 0;
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
  width: ${({ depth }) =>
    `calc(100% - ${depth} * ${themeCssVariables.spacing[8]})`};

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledStackedStepTitle = styled.span`
  flex: 1;
  text-align: left;
`;

type GettingStartedStepStackProps = {
  steps: GettingStartedStepDefinition[];
  selectedStep: GettingStartedStepDefinition;
  completedSteps: GettingStartedStep[];
  isSaving: boolean;
  onSelectStep: (step: GettingStartedStep) => void;
};

export const GettingStartedStepStack = ({
  steps,
  selectedStep,
  completedSteps,
  isSaving,
  onSelectStep,
}: GettingStartedStepStackProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const selectedStepIndex = steps.indexOf(selectedStep);
  const stackedSteps = [3, 2, 1]
    .filter((depth) => depth < steps.length)
    .map((depth) => ({
      depth,
      step: steps[(selectedStepIndex - depth + steps.length) % steps.length]
        .key,
    }));

  return (
    <div>
      {stackedSteps.map(({ depth, step }) => {
        const { Icon, iconColor, title } = GETTING_STARTED_STEP_CONTENT[step];

        return (
          <StyledStackedStep
            key={step}
            type="button"
            depth={depth}
            disabled={isSaving}
            onClick={() => onSelectStep(step)}
          >
            <Icon size={theme.icon.size.md} color={iconColor} />
            <StyledStackedStepTitle>{t(title)}</StyledStackedStepTitle>
            <GettingStartedStepRewardChip
              step={step}
              isCompleted={completedSteps.includes(step)}
            />
          </StyledStackedStep>
        );
      })}
      <StyledActiveStep>
        <StyledSteps aria-label={t`Getting started steps`}>
          {steps.map(({ key }) => (
            <StyledTick
              key={key}
              type="button"
              aria-label={t(GETTING_STARTED_STEP_CONTENT[key].title)}
              aria-current={key === selectedStep.key ? 'step' : undefined}
              data-completed={completedSteps.includes(key) || undefined}
              disabled={isSaving}
              onClick={() => onSelectStep(key)}
            />
          ))}
        </StyledSteps>
        <GettingStartedStepCard
          step={selectedStep}
          isCompleted={completedSteps.includes(selectedStep.key)}
        />
      </StyledActiveStep>
    </div>
  );
};
