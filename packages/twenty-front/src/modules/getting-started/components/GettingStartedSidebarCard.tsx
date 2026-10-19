import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AppPath,
  GETTING_STARTED_STEPS,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { IconRocket, IconCreditCard } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { Link } from 'react-router-dom';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { GettingStartedSnoozeMenu } from '@/getting-started/components/GettingStartedSnoozeMenu';
import { StyledGettingStartedRow } from '@/getting-started/components/GettingStartedStyles';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 6px;
  margin: 8px;
  padding: 8px;
  progress {
    accent-color: ${themeCssVariables.color.blue};
    height: 4px;
    width: 100%;
  }
`;

export const GettingStartedSidebarCard = () => {
  const { t } = useLingui();
  const { completedSteps, loading, error, isComplete } = useGettingStarted();
  const { showCountdown, daysLeft } = useGettingStartedTrial();
  if (loading || error) return null;
  return (
    <StyledCard>
      <StyledGettingStartedRow>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<IconRocket size={14} />}
          nativeButton={false}
          render={<Link to={AppPath.GettingStarted} />}
        >{t`Getting started`}</Button>
        <span>
          {completedSteps.length}/{GETTING_STARTED_STEPS.length}
        </span>
        <GettingStartedSnoozeMenu placement="top" />
      </StyledGettingStartedRow>
      <progress
        aria-label={t`Getting started progress`}
        value={completedSteps.length}
        max={GETTING_STARTED_STEPS.length}
      />
      {showCountdown && <span>{t`${daysLeft} days left`}</span>}
      {showCountdown ? (
        <Button
          size="sm"
          fullWidth
          href={getSettingsPath(SettingsPath.Billing)}
          startIcon={<IconCreditCard size={12} />}
        >{t`Keep Pro`}</Button>
      ) : (
        <Button
          size="sm"
          fullWidth
          nativeButton={false}
          render={<Link to={AppPath.GettingStarted} />}
        >
          {isComplete ? t`View setup` : t`Continue setup`}
        </Button>
      )}
    </StyledCard>
  );
};
