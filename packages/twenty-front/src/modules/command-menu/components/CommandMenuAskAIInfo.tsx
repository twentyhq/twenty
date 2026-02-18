import { currentAIChatThreadTitleStateV2 } from '@/ai/states/currentAIChatThreadTitleStateV2';
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
    currentAIChatThreadTitleStateV2,
  );

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip
        text={currentAIChatThreadTitle ?? t`Ask AI`}
      />
    </StyledPageTitle>
  );
};
