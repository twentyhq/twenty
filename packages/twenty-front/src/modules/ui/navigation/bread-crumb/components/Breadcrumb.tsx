import { MobileBreadcrumb } from '@/ui/navigation/bread-crumb/components/MobileBreadcrumb';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type BreadcrumbProps = {
  className?: string;
  links: { children: string | ReactNode; href?: string }[];
};

const StyledWrapper = styled.nav`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledCrumbContainer = styled.span<{ $isLast: boolean }>`
  flex: ${({ $isLast }) => ($isLast ? '0 1 auto' : '0 0 auto')};
  min-width: 0;
  overflow: hidden;
`;

const StyledLink = styled(Link)`
  color: inherit;
  display: block;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDivider = styled.span`
  flex: 0 0 ${themeCssVariables.spacing[2]};
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
        const isLast = index === links.length - 1;

        return (
          <Fragment key={index}>
            <StyledCrumbContainer $isLast={isLast}>
              {link.href ? (
                <StyledLink title={text} to={link.href}>
                  {link.children}
                </StyledLink>
              ) : (
                <StyledText title={text}>{link.children}</StyledText>
              )}
            </StyledCrumbContainer>
            {index < links.length - 1 && <StyledDivider>/</StyledDivider>}
          </Fragment>
        );
      })}
    </StyledWrapper>
  );
};
