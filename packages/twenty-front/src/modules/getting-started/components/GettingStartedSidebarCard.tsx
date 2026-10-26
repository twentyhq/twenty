import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { NavigationLink } from '@/ui/input/components/NavigationLink';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMatch } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import {
  IconChevronRight,
  IconCreditCard,
  IconHourglassHigh,
  IconRocket,
} from 'twenty-ui/icon';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
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
  padding-left: ${themeCssVariables.spacing[1]};
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

  [data-countdown] > & {
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
  const { progress } = useGettingStartedProgress();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const {
    isCountdownVisible,
    daysLeft,
    trialDays,
    canKeepPlan,
    keepPlanLabel,
  } = useGettingStartedTrial();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const isGettingStartedPageOpen = isDefined(useMatch(AppPath.GettingStarted));

  if (!isNavigationDrawerContentExpanded || !isDefined(progress)) {
    return null;
  }

  const remainingSteps = getGettingStartedRemainingSteps({
    steps: progress.steps,
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
              <StyledStepCount>
                {`${progress.completedSteps.length}/${progress.steps.length}`}
              </StyledStepCount>
              {!isGettingStartedPageOpen && (
                <NavigationLink to={AppPath.GettingStarted}>
                  {({ href, render }) => (
                    <LightIconButton
                      nativeButton={false}
                      role="link"
                      href={href}
                      render={render}
                      aria-label={t`Open Getting started`}
                    >
                      <IconChevronRight />
                    </LightIconButton>
                  )}
                </NavigationLink>
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
