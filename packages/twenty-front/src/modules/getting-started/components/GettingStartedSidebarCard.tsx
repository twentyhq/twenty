import { GettingStartedSnoozeMenu } from '@/getting-started/components/GettingStartedSnoozeMenu';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCreditCard, IconRocket } from 'twenty-ui/icon';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['1.5']};
  padding: ${themeCssVariables.spacing[2]};
`;

export const GettingStartedSidebarCard = () => {
  const { t } = useLingui();
  const { progress } = useGettingStartedProgress();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const { isCountdownVisible, daysLeft, canKeepPlan, keepPlanLabel } =
    useGettingStartedTrial();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();

  if (!isNavigationDrawerContentExpanded || !isDefined(progress)) {
    return null;
  }

  const remainingSteps = getGettingStartedRemainingSteps({
    completedSteps: progress.completedSteps,
    permissionFlagMap,
  });

  if (remainingSteps.length === 0) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <StyledContainer>
        <Card.Root backgroundColor={themeCssVariables.background.primary}>
          <StyledCardBody>
            <NavigationDrawerItem
              label={t`Getting started`}
              secondaryLabel={`${progress.completedSteps.length}/${GETTING_STARTED_STEPS.length}`}
              Icon={IconRocket}
              to={AppPath.GettingStarted}
              rightOptions={<GettingStartedSnoozeMenu side="top" />}
            />
            <ProgressBar
              aria-label={t`Getting started progress`}
              value={progress.completedSteps.length}
              max={GETTING_STARTED_STEPS.length}
              size="sm"
              backgroundColor={themeCssVariables.background.tertiary}
              barColor={themeCssVariables.color.blue}
              withBorderRadius
            />
            {isCountdownVisible && (
              <span>
                {plural(daysLeft, {
                  one: '# day left',
                  other: '# days left',
                })}
              </span>
            )}
            {canKeepPlan ? (
              <NavigationButton
                size="sm"
                fullWidth
                startIcon={<IconCreditCard />}
                to={getSettingsPath(SettingsPath.Billing)}
              >
                {keepPlanLabel}
              </NavigationButton>
            ) : (
              <NavigationButton
                size="sm"
                fullWidth
                to={AppPath.GettingStarted}
              >{t`Continue setup`}</NavigationButton>
            )}
          </StyledCardBody>
        </Card.Root>
      </StyledContainer>
    </NavigationDrawerSection>
  );
};
