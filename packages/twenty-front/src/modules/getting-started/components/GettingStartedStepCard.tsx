import { GettingStartedStepRewardChip } from '@/getting-started/components/GettingStartedStepRewardChip';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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

const StyledPermissionNotice = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type GettingStartedStepCardProps = {
  step: GettingStartedStepDefinition;
  isCompleted: boolean;
};

export const GettingStartedStepCard = ({
  step,
  isCompleted,
}: GettingStartedStepCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  const content = GETTING_STARTED_STEP_CONTENT[step.key];

  return (
    <Card.Root
      fullWidth
      backgroundColor={themeCssVariables.background.primary}
      render={<section />}
      aria-label={t(content.title)}
    >
      <StyledHeading isCompleted={isCompleted}>
        {isCompleted ? (
          <IconCheck size={theme.icon.size.lg} />
        ) : (
          <content.Icon size={theme.icon.size.lg} color={content.iconColor} />
        )}
        <StyledTitle>
          <Heading size="lg">
            {t(isCompleted ? content.doneTitle : content.title)}
          </Heading>
          <StyledDescription>{t(content.description)}</StyledDescription>
        </StyledTitle>
        <GettingStartedStepRewardChip
          step={step.key}
          isCompleted={isCompleted}
        />
      </StyledHeading>
      <StyledBody>
        {permissionFlagMap[step.permissionFlag] ? (
          <GettingStartedStepAction step={step} />
        ) : (
          <StyledPermissionNotice>{t`Ask your workspace admin for permission to complete this step.`}</StyledPermissionNotice>
        )}
      </StyledBody>
    </Card.Root>
  );
};
