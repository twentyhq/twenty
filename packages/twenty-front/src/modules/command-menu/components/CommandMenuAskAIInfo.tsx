import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledPageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const CommandMenuAskAIInfo = () => {
  const currentAIChatThreadTitle = useRecoilValueV2(
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
