import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  GETTING_STARTED_STEPS,
  SettingsPath,
  type GettingStartedProgress,
  type GettingStartedStep,
} from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconRocket, IconCoins, IconCheck } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedSteps';
import { GettingStartedStepCard } from '@/getting-started/components/GettingStartedStepCard';
import {
  StyledGettingStartedDigit,
  StyledGettingStartedRow,
  StyledGettingStartedMuted,
  StyledGettingStartedBadge,
} from '@/getting-started/components/GettingStartedStyles';

const StyledPage = styled.div`
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;
const StyledHeader = styled.header`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
`;
const StyledScroll = styled.div`
  flex: 1;
  overflow: auto;
  padding: 48px 24px;
`;
const StyledContent = styled.main`
  margin: 0 auto;
  max-width: 560px;
  h1 {
    font-size: 20px;
    font-weight: 500;
    margin: 16px 0;
  }
`;
const StyledGoal = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 8px;
  margin: 40px 0 20px;
`;
const StyledStack = styled.div`
  padding-left: 20px;
  position: relative;
`;
const StyledSteps = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  left: -8px;
  position: absolute;
  top: 18px;
`;
const StyledTick = styled.button<{ active: boolean; completed: boolean }>`
  background: ${({ active, completed }) => (active ? themeCssVariables.font.color.primary : completed ? themeCssVariables.color.green : themeCssVariables.border.color.medium)};
  border: 0;
  border-radius: 3px;
  cursor: pointer;
  height: 20px;
  outline-offset: 5px;
  padding: 0;
  width: 3px;
  &::after {
    content: '';
    display: block;
    height: 100%;
    margin-left: -6px;
    width: 15px;
  }
`;
const StyledCollapsedCard = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 10px 10px 0 0;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 8px;
  height: 35px;
  margin: 0 auto -8px;
  padding: 0 14px 8px;
  width: calc(100% - 24px);
  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const GettingStartedPageContent = ({
  progress,
  selectedStep,
  loading,
  error,
  saving,
  showCountdown,
  daysLeft,
  trialEnd,
  select,
  onSkip,
  onRetry,
  snoozeMenu,
  children,
}: {
  progress?: GettingStartedProgress;
  selectedStep: GettingStartedStep;
  loading: boolean;
  error: boolean;
  saving: boolean;
  showCountdown: boolean;
  daysLeft: number;
  trialEnd: Date | null;
  select: (step: GettingStartedStep) => void;
  onSkip: () => void;
  onRetry: () => void;
  snoozeMenu: ReactNode;
  children: ReactNode;
}) => {
  const { t } = useLingui();
  const completedSteps = progress?.completedSteps ?? [];
  const isComplete = GETTING_STARTED_STEPS.every((step) =>
    completedSteps.includes(step),
  );
  const selectedIndex = GETTING_STARTED_STEPS.indexOf(selectedStep);
  const behind = [2, 1].map(
    (offset) =>
      GETTING_STARTED_STEPS[
        (selectedIndex + offset) % GETTING_STARTED_STEPS.length
      ],
  );
  return (
    <StyledPage>
      <StyledHeader>
        <StyledGettingStartedRow>
          <IconRocket size={16} />
          <span>{t`Getting started`}</span>
        </StyledGettingStartedRow>
        <StyledGettingStartedRow>
          {showCountdown && (
            <Button
              size="sm"
              href={getSettingsPath(SettingsPath.Billing)}
            >{t`Keep Pro`}</Button>
          )}
          {snoozeMenu}
        </StyledGettingStartedRow>
      </StyledHeader>
      <StyledScroll>
        <StyledContent>
          {showCountdown ? (
            <>
              <StyledGettingStartedRow>
                {String(daysLeft)
                  .padStart(2, '0')
                  .split('')
                  .map((digit, index) => (
                    <StyledGettingStartedDigit key={index}>
                      {digit}
                    </StyledGettingStartedDigit>
                  ))}
              </StyledGettingStartedRow>
              <h1>{t`days left in your trial`}</h1>
              <Button
                size="sm"
                href={getSettingsPath(SettingsPath.Billing)}
              >{t`Keep Pro`}</Button>
            </>
          ) : (
            <h1>{t`Finish your setup`}</h1>
          )}
          {loading && !progress ? (
            <p role="status">{t`Loading your progress…`}</p>
          ) : error && !progress ? (
            <div role="alert">
              <p>{t`Could not load Getting started.`}</p>
              <Button onClick={onRetry}>{t`Try again`}</Button>
            </div>
          ) : (
            <>
              <StyledGoal>
                <StyledGettingStartedBadge>
                  {isComplete ? (
                    <IconCheck size={12} />
                  ) : (
                    `${completedSteps.length}/${GETTING_STARTED_STEPS.length}`
                  )}
                </StyledGettingStartedBadge>
                <span>
                  {isComplete ? t`All steps done` : t`Finish your setup`}
                </span>
                {trialEnd && !isComplete && (
                  <StyledGettingStartedMuted>{t`before ${trialEnd.toLocaleDateString()}`}</StyledGettingStartedMuted>
                )}
                <StyledGettingStartedBadge>
                  <IconCoins size={12} />
                  {t`${progress?.creditsEarned ?? 0} credits earned`}
                </StyledGettingStartedBadge>
              </StyledGoal>
              <StyledStack>
                <StyledSteps aria-label={t`Getting started steps`}>
                  {GETTING_STARTED_STEPS.map((step) => (
                    <StyledTick
                      key={step}
                      active={step === selectedStep}
                      completed={completedSteps.includes(step)}
                      aria-label={t(GETTING_STARTED_STEP_CONTENT[step].title)}
                      aria-current={step === selectedStep ? 'step' : undefined}
                      disabled={saving}
                      onClick={() => select(step)}
                    />
                  ))}
                </StyledSteps>
                {behind.map((step, index) => {
                  const content = GETTING_STARTED_STEP_CONTENT[step];
                  return (
                    <StyledCollapsedCard
                      key={step}
                      style={{ width: `calc(100% - ${(2 - index) * 24}px)` }}
                      onClick={() => select(step)}
                      disabled={saving}
                    >
                      <content.Icon size={14} />
                      {t(content.title)}
                    </StyledCollapsedCard>
                  );
                })}
                <GettingStartedStepCard
                  step={selectedStep}
                  completed={completedSteps.includes(selectedStep)}
                >
                  {children}
                </GettingStartedStepCard>
              </StyledStack>
              <StyledGettingStartedRow
                style={{ justifyContent: 'center', marginTop: 20 }}
              >
                {!isComplete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={saving}
                    onClick={onSkip}
                  >
                    {completedSteps.includes(selectedStep)
                      ? t`Back to current step`
                      : t`Skip`}
                  </Button>
                )}
              </StyledGettingStartedRow>
            </>
          )}
        </StyledContent>
      </StyledScroll>
    </StyledPage>
  );
};
