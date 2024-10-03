import { PAGES_REDIRECT_TO_APP } from '@/ui/navigation/bread-crumb/constants/PagesRedirectToApp';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from 'twenty-ui';

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
  const theme = useTheme();

  if (isMobile && links.length > 0) {
    const currentPage = links[links.length - 1].children;
    const previousLink = links[links.length - 2];
    const shouldRedirectToApp = PAGES_REDIRECT_TO_APP.includes(
      currentPage as string,
    );

    return (
      <StyledWrapper className={className}>
        {shouldRedirectToApp ? (
          <Fragment>
            <IconChevronLeft size={theme.icon.size.md} />
            <StyledLink title="Back to App" to="/">
              Back to App
            </StyledLink>
          </Fragment>
        ) : previousLink?.href ? (
          <Fragment>
            <IconChevronLeft size={theme.icon.size.md} />
            <StyledLink title="Back to previous" to={previousLink.href}>
              Back to {previousLink.children}
            </StyledLink>
          </Fragment>
        ) : (
          <StyledText title={''}>{previousLink?.children}</StyledText>
        )}
      </StyledWrapper>
    );
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
