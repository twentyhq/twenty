import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

type BreadcrumbProps = {
  className?: string;
  links: { children: string; href?: string }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${({ theme }) => theme.font.color.extraLight};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const Breadcrumb = ({ className, links }: BreadcrumbProps) => (
  <StyledWrapper className={className}>
    {links.map((link, index) => (
      <Fragment key={index}>
        {link.href ? (
          <StyledLink to={link.href}>{link.children}</StyledLink>
        ) : (
          <StyledText>{link.children}</StyledText>
        )}
        {index < links.length - 1 && '/'}
      </Fragment>
    ))}
  </StyledWrapper>
);
