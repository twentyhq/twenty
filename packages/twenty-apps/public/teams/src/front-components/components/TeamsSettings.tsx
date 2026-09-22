import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ChatSettings } from 'src/features/chat/front-components/ChatSettings';
import { TranscriptSettings } from 'src/features/transcripts/front-components/TranscriptSettings';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[6]};
  width: 100%;
`;

export const TeamsSettings = () => (
  <StyledContainer>
    <ChatSettings />
    <TranscriptSettings />
  </StyledContainer>
);
