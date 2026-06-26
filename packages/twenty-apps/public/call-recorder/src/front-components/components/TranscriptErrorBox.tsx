import styled from '@emotion/styled';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${recordingThemeCssVariables.font.family};
  height: 100%;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;

const StyledErrorBox = styled.div`
  background: ${recordingThemeCssVariables.background.transparentDanger};
  border: 1px solid ${recordingThemeCssVariables.border.colorDanger};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[1]};
  padding: ${recordingThemeCssVariables.spacing[3]};
`;

const StyledErrorTitle = styled.span`
  color: ${recordingThemeCssVariables.font.colorDanger};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
`;

const StyledErrorDescription = styled.span`
  color: ${recordingThemeCssVariables.font.colorSecondary};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
`;

type TranscriptErrorBoxProps = {
  title: string;
  description: string;
};

export const TranscriptErrorBox = ({
  title,
  description,
}: TranscriptErrorBoxProps) => (
  <StyledStateContainer>
    <StyledErrorBox>
      <StyledErrorTitle>{title}</StyledErrorTitle>
      <StyledErrorDescription>{description}</StyledErrorDescription>
    </StyledErrorBox>
  </StyledStateContainer>
);
