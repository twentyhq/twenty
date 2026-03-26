import { t } from '@lingui/core/macro';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type MobileBreadcrumbProps = {
  className?: string;
  links: { children: string | ReactNode; href?: string }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: grid;
  font-size: ${themeCssVariables.font.size.md};
  grid-auto-flow: column;
  grid-column-gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  max-width: 100%;
  min-width: 0;
`;

const StyledLinkContainer = styled.div`
  > a {
    color: inherit;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledText = styled.span`
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileBreadcrumb = ({
  className,
  links,
}: MobileBreadcrumbProps) => {
  const { theme } = useContext(ThemeContext);
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
          <StyledLinkContainer>
            <Link title={text} to={previousLink.href}>
              {t`Back to ${linkText}`}
            </Link>
          </StyledLinkContainer>
        </>
      ) : (
        <StyledText title={text}>{previousLink?.children}</StyledText>
      )}
    </StyledWrapper>
  );
};
