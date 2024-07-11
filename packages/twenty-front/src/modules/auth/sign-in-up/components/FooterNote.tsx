import styled from '@emotion/styled';
import React from 'react';

type FooterNoteProps = { children: React.ReactNode };

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

export const FooterNote = ({ children }: FooterNoteProps) => (
  <StyledContainer>{children}</StyledContainer>
);
