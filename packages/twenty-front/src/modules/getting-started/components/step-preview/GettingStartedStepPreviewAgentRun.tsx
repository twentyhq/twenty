import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconCheck, IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledAgentRun = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledAgentName = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.purple11};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledStep = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledStepContent = styled.span`
  align-items: center;
  display: inline-flex;
  white-space: pre;

  & strong {
    color: ${themeCssVariables.font.color.primary};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

type GettingStartedStepPreviewAgentRunProps = {
  steps: { id: string; content: ReactNode }[];
};

export const GettingStartedStepPreviewAgentRun = ({
  steps,
}: GettingStartedStepPreviewAgentRunProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledAgentRun>
      <StyledAgentName>
        <IconSparkles size={theme.icon.size.sm} />
        {t`Agent`}
      </StyledAgentName>
      {steps.map((step) => (
        <StyledStep key={step.id}>
          <IconCheck
            size={theme.icon.size.sm}
            color={themeCssVariables.tag.text.green}
          />
          <StyledStepContent>{step.content}</StyledStepContent>
        </StyledStep>
      ))}
    </StyledAgentRun>
  );
};
