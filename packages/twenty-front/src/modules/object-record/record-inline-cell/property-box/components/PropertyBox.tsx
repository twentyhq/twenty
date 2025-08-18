import styled from '@emotion/styled';

interface PropertyBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const StyledPropertyBoxContainer = styled.div`
  align-self: stretch;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const PropertyBox = ({ children, className }: PropertyBoxProps) => (
  <StyledPropertyBoxContainer className={className}>
    {children}
  </StyledPropertyBoxContainer>
);
