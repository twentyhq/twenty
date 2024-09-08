import styled from '@emotion/styled';
import { CSSProperties, Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BreadcrumbProps = {
  className?: string;
  links: {
    href?: string;
    styles?: CSSProperties;
    children?: string | ReactNode;
  }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  // font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  white-space: nowrap;
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

// TODO: not sure that passing styles to the link is a good idea
export const Breadcrumb = ({ className, links }: BreadcrumbProps) => {
  return (
    <StyledWrapper className={className}>
      {links.map((link, index) => {
        const text = typeof link.children === 'string' ? link.children : '';

        return (
          <Fragment key={index}>
            {link.href ? (
              <StyledLink style={link.styles} title={text} to={link.href}>
                {link.children}
              </StyledLink>
            ) : (
              <StyledText style={link.styles} title={text}>
                {link.children}
              </StyledText>
            )}
            {index < links.length - 1 && '/'}
          </Fragment>
        );
      })}
    </StyledWrapper>
  );
};
