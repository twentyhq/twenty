import React from 'react';
import styled from '@emotion/styled';

type FooterNoteProps = React.ComponentProps<'div'>;

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
`;

export const FooterNote = (props: FooterNoteProps) => (
  // eslint-disable-next-line twenty/no-spread-props
  <StyledContainer {...props} />
);
