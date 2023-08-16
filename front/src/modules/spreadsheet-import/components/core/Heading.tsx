import React from 'react';
import styled from '@emotion/styled';

export type Props = React.ComponentProps<'div'> & {
  title: string;
  description?: string;
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-align: center;
`;

const Description = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export function Heading({ title, description, ...props }: Props) {
  return (
    <Container {...props}>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </Container>
  );
}
