import { GettingStartedKeepPlanButton } from '@/getting-started/components/GettingStartedKeepPlanButton';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Link, useMatch } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, IconRocket } from 'twenty-ui/icon';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SubscriptionStatus } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  position: relative;
`;

const StyledCardLink = styled(Link)`
  border-radius: inherit;
  inset: 0;
  position: absolute;
`;

const StyledButtonLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[6]};
  white-space: nowrap;
`;

const StyledStepCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  text-align: end;
`;

const StyledTrialProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]} 0;
`;

const StyledTrialHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  white-space: nowrap;
`;

const StyledTrialProgressBar = styled.div`
  border-radius: ${themeCssVariables.border.radius.pill};
  margin: ${themeCssVariables.spacing[1]} 0;
  overflow: hidden;
`;

export const GettingStartedSidebarCard = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isTrialing = useSubscriptionStatus() === SubscriptionStatus.Trialing;
  const { progress } = useGettingStartedProgress({ isEnabled: isTrialing });
  const { isCountdownVisible, canKeepPlan } = useGettingStartedTrial();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const isGettingStartedPageOpen = isDefined(useMatch(AppPath.GettingStarted));

  if (
    !isTrialing ||
    !isNavigationDrawerContentExpanded ||
    !isDefined(progress) ||
    progress.isHidden
  ) {
    return null;
  }

  const remainingSteps = getGettingStartedRemainingSteps({
    steps: progress.steps,
    completedStepActionKeys: progress.completedStepActionKeys,
  });

  if (remainingSteps.length === 0) {
    return null;
  }

  const completedStepCount = progress.completedStepActionKeys.length;
  const stepCount = progress.steps.length;

  return (
    <NavigationDrawerSection>
      <StyledContainer>
        <Card.Root backgroundColor={themeCssVariables.background.primary}>
          <StyledCardBody>
            {isCountdownVisible ? (
              <StyledTrialProgress>
                <StyledTrialHeader>
                  {t`Getting started`}
                  {!isGettingStartedPageOpen && (
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                      color={theme.font.color.tertiary}
                    />
                  )}
                </StyledTrialHeader>
                <StyledTrialProgressBar>
                  <ProgressBar
                    aria-label={t`Getting started progress`}
                    value={completedStepCount}
                    max={stepCount}
                    size="sm"
                    backgroundColor={themeCssVariables.border.color.medium}
                    barColor={themeCssVariables.color.green9}
                  />
                </StyledTrialProgressBar>
              </StyledTrialProgress>
            ) : (
              <>
                <StyledHeader>
                  <IconRocket
                    size={theme.icon.size.md}
                    color={theme.tag.text.purple}
                  />
                  {t`Getting started`}
                  <StyledStepCount>
                    {`${completedStepCount}/${stepCount}`}
                  </StyledStepCount>
                </StyledHeader>
                <ProgressBar
                  aria-label={t`Getting started progress`}
                  value={completedStepCount}
                  max={stepCount}
                  size="xs"
                  backgroundColor={
                    themeCssVariables.background.transparent.medium
                  }
                  barColor={themeCssVariables.color.blue}
                  withBorderRadius
                />
              </>
            )}
            <StyledButtonLayer>
              {canKeepPlan ? (
                <GettingStartedKeepPlanButton size="sm" fullWidth />
              ) : (
                <NavigationButton
                  size="sm"
                  fullWidth
                  to={AppPath.GettingStarted}
                >{t`Continue setup`}</NavigationButton>
              )}
            </StyledButtonLayer>
          </StyledCardBody>
        </Card.Root>
        {!isGettingStartedPageOpen && (
          <StyledCardLink
            to={AppPath.GettingStarted}
            aria-label={t`Open Getting started`}
          />
        )}
      </StyledContainer>
    </NavigationDrawerSection>
  );
};
