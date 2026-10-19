import { type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type GettingStartedStep } from 'twenty-shared/types';
import { IconCheck, IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { GETTING_STARTED_STEP_CONTENT } from '@/getting-started/constants/GettingStartedSteps';
import {
  StyledGettingStartedBadge,
  StyledGettingStartedMuted,
  StyledGettingStartedRow,
} from '@/getting-started/components/GettingStartedStyles';

const StyledCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 12px;
  box-shadow: ${themeCssVariables.boxShadow.light};
  overflow: hidden;
  position: relative;
  width: 100%;
`;
const StyledHeading = styled.div<{ completed: boolean }>`
  background: ${({ completed }) => (completed ? themeCssVariables.color.green3 : 'transparent')};
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 16px;
`;
const StyledBody = styled.div`
  padding: 8px 16px 16px;
`;

export const GettingStartedStepCard = ({
  step,
  completed,
  children,
  action,
}: {
  step: GettingStartedStep;
  completed: boolean;
  children: ReactNode;
  action?: ReactNode;
}) => {
  const { t } = useLingui();
  const content = GETTING_STARTED_STEP_CONTENT[step];
  const Icon = completed ? IconCheck : content.Icon;
  return (
    <StyledCard aria-label={t(content.title)}>
      <StyledHeading completed={completed}>
        <StyledGettingStartedRow
          style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}
        >
          <Icon size={16} />
          <div>
            <div>{t(completed ? content.doneTitle : content.title)}</div>
            <StyledGettingStartedMuted>
              {t(content.description)}
            </StyledGettingStartedMuted>
          </div>
        </StyledGettingStartedRow>
        <StyledGettingStartedRow>
          {content.reward > 0 && (
            <StyledGettingStartedBadge>
              <IconCoins size={12} />
              {step === 'inviteTeam' ? t`+0.5 each` : t`+1`}
            </StyledGettingStartedBadge>
          )}
          {action}
        </StyledGettingStartedRow>
      </StyledHeading>
      <StyledBody>{children}</StyledBody>
    </StyledCard>
  );
};
