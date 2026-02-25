import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledPageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const CommandMenuAskAIInfo = () => {
  const currentAIChatThreadTitle = useAtomStateValue(
    currentAIChatThreadTitleState,
  );

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip
        text={currentAIChatThreadTitle ?? t`Ask AI`}
      />
    </StyledPageTitle>
  );
};
