import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { copilotQueryState } from '@/activities/copilot/right-drawer/states/copilotQueryState';
import {
  AutosizeTextInput,
  AutosizeTextInputVariant,
} from '@/ui/input/components/AutosizeTextInput';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

const StyledChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: ${({ theme }) => theme.spacing(6)};
  padding-bottom: 0px;
`;

const StyledNewMessageArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  padding-top: 0px;
`;

export const RightDrawerAIChat = () => {
  const setCopilotQuery = useSetRecoilState(copilotQueryState);

  return (
    <StyledContainer>
      <StyledChatArea>{/* TODO */}</StyledChatArea>
      <StyledNewMessageArea>
        <AutosizeTextInput
          autoFocus
          placeholder="Ask anything"
          variant={AutosizeTextInputVariant.Icon}
          onValidate={(text) => {
            setCopilotQuery(text);
          }}
        />
      </StyledNewMessageArea>
    </StyledContainer>
  );
};
