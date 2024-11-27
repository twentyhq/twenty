import { MobileBreadcrumb } from '@/ui/navigation/bread-crumb/components/MobileBreadcrumb';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbProps = {
  className?: string;
  links: { children: string | ReactNode; href?: string }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: grid;
  font-size: ${({ theme }) => theme.font.size.md};
  grid-auto-flow: column;
  grid-column-gap: ${({ theme }) => theme.spacing(1)};
  max-width: 100%;
  min-width: 0;
  height: ${({ theme }) => theme.spacing(8)};
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

const StyledDivider = styled.span`
  width: ${({ theme }) => theme.spacing(2)};
`;

export const Breadcrumb = ({ className, links }: BreadcrumbProps) => {
  const isMobile = useIsMobile();

  if (isMobile && links.length > 0) {
    return <MobileBreadcrumb className={className} links={links} />;
  }

  return (
    <StyledWrapper className={className}>
      {links.map((link, index) => {
        const text = typeof link.children === 'string' ? link.children : '';

        return (
          <Fragment key={index}>
            {link.href ? (
              <StyledLink title={text} to={link.href}>
                {link.children}
              </StyledLink>
            ) : (
              <StyledText title={text}>{link.children}</StyledText>
            )}
            {index < links.length - 1 && <StyledDivider>/</StyledDivider>}
          </Fragment>
        );
      })}
    </StyledWrapper>
  );
};
