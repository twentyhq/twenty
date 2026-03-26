import styled from '@emotion/styled';
import { IconUser } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledIcon = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
`;

const StyledText = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
`;

export const CoachingEmptyDetail = () => {
  return (
    <StyledContainer>
      <StyledIcon>
        <IconUser size={48} />
      </StyledIcon>
      <StyledText>Select a customer to view details</StyledText>
    </StyledContainer>
  );
};
