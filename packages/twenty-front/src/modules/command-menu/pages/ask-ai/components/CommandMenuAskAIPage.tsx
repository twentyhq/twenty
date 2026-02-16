import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { AIChatTab } from '@/ai/components/AIChatTab';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuAskAIPage = () => {
  const currentAIChatThreadTitle = useRecoilValue(
    currentAIChatThreadTitleState,
  );
  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  useEffect(() => {
    if (isNonEmptyString(currentAIChatThreadTitle)) {
      updateCommandMenuPageInfo({ pageTitle: currentAIChatThreadTitle });
    }
  }, [currentAIChatThreadTitle, updateCommandMenuPageInfo]);

  return (
    <StyledContainer>
      <AIChatTab />
    </StyledContainer>
  );
};
