import styled from '@emotion/styled';

interface PropertyBoxProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const StyledPropertyBoxContainer = styled.div`
  align-self: stretch;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const PropertyBox = ({
  children,
  className,
  ariaLabel,
}: PropertyBoxProps) => (
  <StyledPropertyBoxContainer className={className} aria-label={ariaLabel}>
    {children}
  </StyledPropertyBoxContainer>
);
