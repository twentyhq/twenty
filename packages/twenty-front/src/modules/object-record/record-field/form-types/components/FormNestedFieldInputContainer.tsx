import styled from '@emotion/styled';

const StyledFormNestedFieldInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const FormNestedFieldInputContainer =
  StyledFormNestedFieldInputContainer;
