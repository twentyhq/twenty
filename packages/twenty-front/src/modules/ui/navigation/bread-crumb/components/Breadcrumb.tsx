import styled from '@emotion/styled';
import { CSSProperties, Fragment } from 'react';
import { Link } from 'react-router-dom';

type BreadcrumbProps = {
  className?: string;
  links: { children: string; href?: string; styles?: CSSProperties }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  // font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  max-width: 100%;
  min-width: 0;
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Breadcrumb = ({ className, links }: BreadcrumbProps) => (
  <StyledWrapper className={className}>
    {links.map((link, index) => (
      <Fragment key={index}>
        {link.href ? (
          <StyledLink style={link.styles} title={link.children} to={link.href}>
            {link.children}
          </StyledLink>
        ) : (
          <StyledText style={link.styles} title={link.children}>
            {link.children}
          </StyledText>
        )}
        {index < links.length - 1 && '/'}
      </Fragment>
    ))}
  </StyledWrapper>
);
