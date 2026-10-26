import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.span`
  display: flex;
  flex-shrink: 0;
`;

type CoreAgentNameCellProps = {
  agent: Pick<CoreAgent, 'id' | 'label'>;
};

export const CoreAgentNameCell = ({ agent }: CoreAgentNameCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <CoreAgentIcon agentId={agent.id} size={theme.icon.size.md} />
      </StyledIconContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(agent.label) ? agent.label : t`Untitled`}
      />
    </StyledContainer>
  );
};
