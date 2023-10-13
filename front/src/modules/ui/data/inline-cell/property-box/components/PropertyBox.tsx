import styled from '@emotion/styled';

const StyledPropertyBoxContainer = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

interface PropertyBoxProps {
  children: React.ReactNode;
  extraPadding?: boolean;
}

export const PropertyBox = ({ children }: PropertyBoxProps) => (
  <StyledPropertyBoxContainer>{children}</StyledPropertyBoxContainer>
);
