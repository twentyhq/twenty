import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { GETTING_STARTED_STEP_ACTIONS } from '@/getting-started/constants/GettingStartedStepActions';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedStepContent';
import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from '@/getting-started/constants/GettingStartedStepPermissionFlags';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { GettingStartedStep } from '~/generated-metadata/graphql';

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
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentUser = useAtomStateValue(currentUserState);
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const { numberFormat } = useNumberFormat();

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
              isDefined(onboardingConfig) && (
                <>
                  {step === GettingStartedStep.CONNECT_MAILBOX &&
                    !isCompleted &&
                    currentUser?.isWorkspaceCreator === true && (
                      <OnboardingCreditsRewardChip
                        formattedCreditsReward={formatOnboardingCredits(
                          onboardingConfig.importContactsCreditsReward,
                          numberFormat,
                        )}
                      />
                    )}
                  {step === GettingStartedStep.INVITE_TEAM && (
                    <OnboardingCreditsRewardChip
                      formattedCreditsReward={formatOnboardingCredits(
                        onboardingConfig.inviteTeamCreditsRewardPerUser,
                        numberFormat,
                      )}
                      isRewardPerItem
                    />
                  )}
                </>
              )
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
