import styled from '@emotion/styled';
import React from 'react';

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 280px;
  text-align: center;

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const FooterNote = () => (
  <StyledContainer>
    By using Twenty, you agree to the{' '}
    <a
      href="https://twenty.com/legal/terms"
      target="_blank"
      rel="noopener noreferrer"
    >
      Terms of Service
    </a>{' '}
    and{' '}
    <a
      href="https://twenty.com/legal/privacy"
      target="_blank"
      rel="noopener noreferrer"
    >
      Privacy Policy
    </a>
    .
  </StyledContainer>
);
