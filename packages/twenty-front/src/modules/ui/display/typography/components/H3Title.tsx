import { ReactNode } from 'react';
import styled from '@emotion/styled';

type H3TitleProps = {
  title: ReactNode;
  className?: string;
};

const StyledH3Title = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const H3Title = ({ title, className }: H3TitleProps) => {
  return <StyledH3Title className={className}>{title}</StyledH3Title>;
};
