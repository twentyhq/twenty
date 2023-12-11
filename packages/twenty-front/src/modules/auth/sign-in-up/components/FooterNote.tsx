import React from 'react';
import styled from '@emotion/styled';

type FooterNoteProps = { children: React.ReactNode };

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
`;

export const FooterNote = ({ children }: FooterNoteProps) => (
  <StyledContainer>{children}</StyledContainer>
);
