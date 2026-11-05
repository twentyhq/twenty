import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { WelcomePersonChip } from '@/onboarding/components/WelcomePersonChip';

const StyledPreamble = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4em;
  overflow-wrap: break-word;
  width: 100%;
`;

const StyledTitleRun = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

export const WorkspaceSetupChatPreamble = () => {
  const { t } = useLingui();

  return (
    <StyledPreamble>
      <StyledTitleRun>
        {t`Welcome to your workspace`}
        <WelcomePersonChip />
      </StyledTitleRun>{' '}
      <span>{t`Let's set it up around the way you work.`}</span>
    </StyledPreamble>
  );
};
