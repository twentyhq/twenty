import styled from '@emotion/styled';

const StyledCompanyPropertyBox = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledCompanyPropertyBoxContainer = styled.div<{
  extraPadding?: boolean;
}>`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 12px;
  padding: ${({ extraPadding }) => (extraPadding ? '4px 24px' : '4px 12px')};
`;

interface PropertyBoxProps {
  children: JSX.Element;
  extraPadding?: boolean;
}

export function PropertyBox({
  children,
  extraPadding = false,
}: PropertyBoxProps) {
  return (
    <StyledCompanyPropertyBox>
      <StyledCompanyPropertyBoxContainer>
        {children}
      </StyledCompanyPropertyBoxContainer>
    </StyledCompanyPropertyBox>
  );
}
