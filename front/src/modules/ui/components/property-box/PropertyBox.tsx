import styled from '@emotion/styled';

const StyledCompanyPropertyBox = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0px 12px;
`;

const StyledCompanyPropertyBoxContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 12px;
`;

export function PropertyBox({ children }: { children: JSX.Element }) {
  return (
    <StyledCompanyPropertyBox>
      <StyledCompanyPropertyBoxContainer>
        {children}
      </StyledCompanyPropertyBoxContainer>
    </StyledCompanyPropertyBox>
  );
}
