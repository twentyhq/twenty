import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';


const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${themeCssVariables.font.family};
  height: 100%;
  padding: ${themeCssVariables.spacing['4']};
`;

const StyledErrorBox = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  padding: ${themeCssVariables.spacing['3']};
`;

const StyledErrorTitle = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledErrorDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
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
