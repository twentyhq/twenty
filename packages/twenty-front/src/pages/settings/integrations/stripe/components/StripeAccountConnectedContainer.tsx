import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
  border: none;
`;

const StripeAccountConnectedContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <Container>{children}</Container>;
};

export default StripeAccountConnectedContainer;
