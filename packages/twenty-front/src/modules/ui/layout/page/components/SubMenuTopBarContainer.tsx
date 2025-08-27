import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { type JSX, type ReactNode } from 'react';
import { PageBody } from './PageBody';
import { PageHeader } from './PageHeader';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title?: string | JSX.Element;
  reserveTitleSpace?: boolean;
  actionButton?: ReactNode;
  className?: string;
  links: BreadcrumbProps['links'];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTitle = styled.h3<{ reserveTitleSpace?: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: 1.2;
  margin: ${({ theme }) => theme.spacing(8, 8, 2)};
  min-height: ${({ theme, reserveTitleSpace }) =>
    reserveTitleSpace ? theme.spacing(5) : 'none'};
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
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
        {(title || reserveTitleSpace) && (
          <StyledTitle reserveTitleSpace={reserveTitleSpace}>
            {title}
          </StyledTitle>
        )}
        {children}
      </PageBody>
    </StyledContainer>
  );
};
