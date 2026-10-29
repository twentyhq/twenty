import { GettingStartedKeepPlanButton } from '@/getting-started/components/GettingStartedKeepPlanButton';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Link, useMatch } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronRight,
  IconHourglassHigh,
  IconRocket,
} from 'twenty-ui/icon';
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
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;

  &[data-countdown] {
    color: ${themeCssVariables.font.color.secondary};
    height: ${themeCssVariables.spacing[8]};
  }
`;

const StyledStepCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.regular};
  text-align: end;

  &[data-countdown] {
    color: ${themeCssVariables.font.color.light};
    text-align: start;
  }
`;

const StyledDivider = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTrialRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDaysLeft = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTrialLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTrialDays = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTrialDay = styled.span`
  background: ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  flex: 1;
  height: ${themeCssVariables.spacing['1.5']};

  &[data-remaining] {
    background: ${themeCssVariables.color.amber10};
  }
`;

export const GettingStartedSidebarCard = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isTrialing = useSubscriptionStatus() === SubscriptionStatus.Trialing;
  const { progress } = useGettingStartedProgress({ isEnabled: isTrialing });
  const { isCountdownVisible, daysLeft, trialDays, canKeepPlan } =
    useGettingStartedTrial();
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
    completedSteps: progress.completedSteps,
  });

  if (remainingSteps.length === 0) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <StyledContainer>
        <Card.Root backgroundColor={themeCssVariables.background.primary}>
          <StyledCardBody>
            <StyledHeader data-countdown={isCountdownVisible || undefined}>
              <IconRocket
                size={theme.icon.size.md}
                color={
                  isCountdownVisible
                    ? theme.font.color.secondary
                    : theme.tag.text.purple
                }
              />
              {t`Getting started`}
              <StyledStepCount data-countdown={isCountdownVisible || undefined}>
                {`${progress.completedSteps.length}/${progress.steps.length}`}
              </StyledStepCount>
              {!isGettingStartedPageOpen && (
                <IconChevronRight
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              )}
            </StyledHeader>
            {isCountdownVisible ? (
              <>
                <StyledDivider />
                <StyledTrialRow>
                  <IconHourglassHigh size={theme.icon.size.md} />
                  <StyledDaysLeft>
                    {plural(daysLeft, {
                      one: '# day left',
                      other: '# days left',
                    })}
                  </StyledDaysLeft>
                  <StyledTrialLabel>{t`Trial`}</StyledTrialLabel>
                </StyledTrialRow>
                <StyledTrialDays aria-hidden>
                  {Array.from({ length: trialDays }, (_, index) => (
                    <StyledTrialDay
                      key={index}
                      data-remaining={
                        index >= trialDays - daysLeft || undefined
                      }
                    />
                  ))}
                </StyledTrialDays>
              </>
            ) : (
              <ProgressBar
                aria-label={t`Getting started progress`}
                value={progress.completedSteps.length}
                max={progress.steps.length}
                size="sm"
                backgroundColor={
                  themeCssVariables.background.transparent.medium
                }
                barColor={themeCssVariables.color.blue}
                withBorderRadius
              />
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
