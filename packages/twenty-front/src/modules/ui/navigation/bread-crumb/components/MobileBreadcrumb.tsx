import { PAGES_REDIRECT_TO_APP } from '@/ui/navigation/bread-crumb/constants/PagesRedirectToApp';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from 'twenty-ui';

export type MobileBreadcrumbProps = {
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

export const MobileBreadcrumb = ({
  className,
  links,
}: MobileBreadcrumbProps) => {
  const theme = useTheme();
  const currentPage = links[links.length - 1].children;
  const previousLink = links[links.length - 2];
  const shouldRedirectToApp =
    typeof currentPage === 'string' &&
    PAGES_REDIRECT_TO_APP.includes(currentPage);

  const text =
    typeof previousLink.children === 'string' ? previousLink.children : '';

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
          <StyledLink title={text} to={previousLink.href}>
            Back to {previousLink.children}
          </StyledLink>
        </Fragment>
      ) : (
        <StyledText title={text}>{previousLink?.children}</StyledText>
      )}
    </StyledWrapper>
  );
};
