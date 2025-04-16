import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledFormFieldInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FormFieldInputContainer = ({
  children,
  testId,
}: {
  children: ReactNode;
  testId?: string;
}) => {
  return (
    <StyledFormFieldInputContainer data-testid={testId}>
      {children}
    </StyledFormFieldInputContainer>
  );
};
