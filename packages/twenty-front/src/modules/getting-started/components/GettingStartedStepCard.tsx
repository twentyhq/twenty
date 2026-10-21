import { GettingStartedStepRewardChip } from '@/getting-started/components/GettingStartedStepRewardChip';
import { GETTING_STARTED_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedStepActions';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from '@/getting-started/constants/GettingStartedStepPermissionFlags';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type GettingStartedStep } from '~/generated-metadata/graphql';

const StyledHeading = styled.div<{ isCompleted: boolean }>`
  align-items: flex-start;
  background: ${({ isCompleted }) =>
    isCompleted
      ? themeCssVariables.color.green3
      : themeCssVariables.background.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0;
`;

const StyledSectionHeader = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledPermissionNotice = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type GettingStartedStepCardProps = {
  step: GettingStartedStep;
  isCompleted: boolean;
};

export const GettingStartedStepCard = ({
  step,
  isCompleted,
}: GettingStartedStepCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  const content = GETTING_STARTED_STEP_CONTENT[step];
  const Icon = isCompleted ? IconCheck : content.Icon;
  const StepAction = GETTING_STARTED_STEP_ACTIONS[step];

  return (
    <Card.Root fullWidth render={<section />} aria-label={t(content.title)}>
      <StyledHeading isCompleted={isCompleted}>
        <Icon size={theme.icon.size.md} />
        <StyledSectionHeader>
          <Section.Header
            title={t(isCompleted ? content.doneTitle : content.title)}
            description={t(content.description)}
            actions={
              <GettingStartedStepRewardChip
                step={step}
                isCompleted={isCompleted}
              />
            }
          />
        </StyledSectionHeader>
      </StyledHeading>
      <Card.Content>
        {permissionFlagMap[GETTING_STARTED_STEP_PERMISSION_FLAGS[step]] ? (
          <StepAction />
        ) : (
          <StyledPermissionNotice>{t`Ask your workspace admin for permission to complete this step.`}</StyledPermissionNotice>
        )}
      </Card.Content>
    </Card.Root>
  );
};
