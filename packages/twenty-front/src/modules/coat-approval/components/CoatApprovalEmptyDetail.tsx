import styled from '@emotion/styled';
import { IconFileCheck } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
`;

export const CoatApprovalEmptyDetail = () => {
  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconFileCheck size={48} />
      </StyledIconContainer>
      <StyledTitle>Select a contract</StyledTitle>
      <StyledSubtitle>
        Click on a contract from the list to view its details and approve it for
        Bexio export.
      </StyledSubtitle>
    </StyledContainer>
  );
};
