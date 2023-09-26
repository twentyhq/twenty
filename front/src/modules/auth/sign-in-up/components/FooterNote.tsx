import React from 'react';
import styled from '@emotion/styled';

type Props = React.ComponentProps<'div'>;

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
`;

// eslint-disable-next-line twenty/no-spread-props
export const FooterNote = (props: Props) => <StyledContainer {...props} />;
