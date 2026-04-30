import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SequenceStepData } from '../types/omnicanal.types';
import { GET_OMNICANAL_DATA } from '../hooks/useOmnicanal';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledStep = styled.div<{ isActive: boolean }>` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; opacity: ${({ isActive }) => (isActive ? 1 : 0.5)}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const StyledOrder = styled.span` font-size: ${themeCssVariables.font.size.lg}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.color.blue}; min-width: 28px; `;
const StyledStepContent = styled.div` flex: 1; display: flex; flex-direction: column; gap: 2px; `;
const StyledSubject = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const StyledBadge = styled.span` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${themeCssVariables.background.transparent.lighter}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; `;

export const SequenceBuilder = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_OMNICANAL_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const steps: SequenceStepData[] = data?.omnicanalData?.steps ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Sequence Steps`}</StyledTitle>
      {steps.map((step) => (
        <StyledStep key={step.id} isActive={step.isActive}>
          <StyledOrder>{step.order}</StyledOrder>
          <StyledStepContent><StyledSubject>{step.subject}</StyledSubject><StyledMeta>{step.channel} &middot; {t`Day`} {step.delayDays} &middot; {step.templateName}</StyledMeta></StyledStepContent>
          <StyledBadge>{step.isActive ? t`Active` : t`Disabled`}</StyledBadge>
        </StyledStep>
      ))}
    </StyledContainer>
  );
};
