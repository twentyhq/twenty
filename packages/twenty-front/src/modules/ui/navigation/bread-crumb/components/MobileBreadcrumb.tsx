import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { getBreadcrumbItems } from '@/ui/navigation/bread-crumb/utils/getBreadcrumbItems';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/icon';
import { Breadcrumb as BreadcrumbPrimitive } from 'twenty-ui/primitives/navigation';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

type MobileBreadcrumbProps = BreadcrumbProps;

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
  min-width: 0;

  > a {
    color: inherit;
    display: block;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:focus-visible {
      outline: 2px solid ${themeCssVariables.color.blue};
      outline-offset: -2px;
    }
  }
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
  const isSettingsPage = useIsSettingsPage();

  if (isSettingsPage && links.length <= 2) {
    return null;
  }

  const previousLink = links.at(-2);

  if (!isDefined(previousLink)) {
    return (
      <BreadcrumbPrimitive
        aria-label={t`Breadcrumb`}
        className={className}
        links={getBreadcrumbItems(links)}
      />
    );
  }

  const text = previousLink.children;
  const title = isNonEmptyString(text) ? text : undefined;

  return (
    <StyledWrapper aria-label={t`Breadcrumb`} className={className}>
      {isNonEmptyString(previousLink.href) ? (
        <>
          <IconChevronLeft size={theme.icon.size.md} aria-hidden />
          <StyledLinkContainer>
            <Link title={title} to={previousLink.href}>
              <Trans>Back to {text}</Trans>
            </Link>
          </StyledLinkContainer>
        </>
      ) : (
        <StyledText title={title}>{text}</StyledText>
      )}
    </StyledWrapper>
  );
};
