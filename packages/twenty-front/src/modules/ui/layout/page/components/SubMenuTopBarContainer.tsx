import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { type JSX, type ReactNode } from 'react';
import { PageBody } from './PageBody';
import { PageHeader } from './PageHeader';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title?: string | JSX.Element;
  reserveTitleSpace?: boolean;
  actionButton?: ReactNode;
  className?: string;
  links: BreadcrumbProps['links'];
  tag?: JSX.Element;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTitle = styled.span<{ reserveTitleSpace?: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.2;
  margin: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[8]}
    ${themeCssVariables.spacing[2]};
  min-height: ${({ reserveTitleSpace }) =>
    reserveTitleSpace ? themeCssVariables.spacing[5] : 'none'};
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
  tag,
  reserveTitleSpace,
  actionButton,
  className,
  links,
}: SubMenuTopBarContainerProps) => {
  return (
    <StyledContainer className={className}>
      <PageHeader title={<Breadcrumb links={links} />}>
        {actionButton}
      </PageHeader>
      <PageBody>
        <InformationBannerWrapper />
        {(isDefined(title) || reserveTitleSpace === true) && (
          <StyledTitle reserveTitleSpace={reserveTitleSpace}>
            {title}
            {tag}
          </StyledTitle>
        )}
        {children}
      </PageBody>
    </StyledContainer>
  );
};
