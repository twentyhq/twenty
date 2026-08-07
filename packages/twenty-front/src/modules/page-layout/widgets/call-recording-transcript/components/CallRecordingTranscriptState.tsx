import { styled } from '@linaria/react';
import { IconFileText } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStateContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  min-height: 160px;
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: 320px;
`;

type CallRecordingTranscriptStateProps = {
  message: string;
};

export const CallRecordingTranscriptState = ({
  message,
}: CallRecordingTranscriptStateProps) => (
  <StyledStateContainer>
    <IconFileText size={24} />
    <StyledMessage>{message}</StyledMessage>
  </StyledStateContainer>
);
