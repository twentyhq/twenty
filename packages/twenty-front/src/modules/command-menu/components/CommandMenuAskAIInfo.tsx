import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledPageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const CommandMenuAskAIInfo = () => {
  const currentAIChatThreadTitle = useRecoilValue(
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
