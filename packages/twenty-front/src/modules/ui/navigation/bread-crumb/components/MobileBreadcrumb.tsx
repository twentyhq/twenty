import { t } from '@lingui/core/macro';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from 'twenty-ui/display';

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
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileBreadcrumb = ({
  className,
  links,
}: MobileBreadcrumbProps) => {
  const theme = useTheme();

  const { openSettingsMenu } = useOpenSettingsMenu();

  const handleBackToSettingsClick = () => {
    openSettingsMenu();
  };

  const previousLink = links[links.length - 2];
  const shouldRedirectToSettings = links.length === 2;

  const text = isNonEmptyString(previousLink.children)
    ? previousLink.children
    : '';

  const linkText = previousLink.children;

  return (
    <StyledWrapper className={className}>
      {shouldRedirectToSettings ? (
        <>
          <IconChevronLeft size={theme.icon.size.md} />
          <StyledText onClick={handleBackToSettingsClick}>
            {t`Back to Settings`}
          </StyledText>
        </>
      ) : previousLink?.href ? (
        <>
          <IconChevronLeft size={theme.icon.size.md} />
          <StyledLink title={text} to={previousLink.href}>
            {t`Back to ${linkText}`}
          </StyledLink>
        </>
      ) : (
        <StyledText title={text}>{previousLink?.children}</StyledText>
      )}
    </StyledWrapper>
  );
};
